import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { findPendingReason, waitForPageReady, type PageReadyView } from './pageReady';

const view: PageReadyView = { innerWidth: 1000, innerHeight: 800 };

const rectAt = (top: number, left = 10, size = 100) =>
  ({ top, left, bottom: top + size, right: left + size, width: size, height: size }) as DOMRect;

function image(attributes: Record<string, string>, complete = false) {
  const element = document.createElement('img');
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  Object.defineProperty(element, 'complete', { value: complete });
  return element;
}

function pageWith(...children: HTMLElement[]) {
  const root = document.createElement('main');
  root.append(...children);
  document.body.append(root);
  return root;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('findPendingReason', () => {
  it('is null for a page with nothing in flight', () => {
    expect(findPendingReason(pageWith(document.createElement('p')), view)).toBeNull();
  });

  it('waits for anything that marks itself pending', () => {
    const marker = document.createElement('span');
    marker.setAttribute('data-page-pending', '');
    expect(findPendingReason(pageWith(marker), view)).toBe('marker');
  });

  it('finds a marker deep in the tree, and lets go once it is removed', () => {
    const inner = document.createElement('span');
    const outer = document.createElement('div');
    outer.append(inner);
    const root = pageWith(outer);
    inner.setAttribute('data-page-pending', '');
    expect(findPendingReason(root, view)).toBe('marker');
    inner.removeAttribute('data-page-pending');
    expect(findPendingReason(root, view)).toBeNull();
  });

  it('waits while a web font is still loading', () => {
    const root = pageWith();
    expect(findPendingReason(root, { ...view, fonts: { status: 'loading' } })).toBe('fonts');
    expect(findPendingReason(root, { ...view, fonts: { status: 'loaded' } })).toBeNull();
  });

  it('waits for an eager image that has not finished', () => {
    expect(findPendingReason(pageWith(image({ src: '/a.png' })), view)).toBe('image');
  });

  it('does not wait for an image that has finished, or failed (complete is true for both)', () => {
    expect(findPendingReason(pageWith(image({ src: '/a.png' }, true)), view)).toBeNull();
  });

  it('ignores an image with no source at all', () => {
    expect(findPendingReason(pageWith(image({})), view)).toBeNull();
  });

  it('waits for a lazy image that is in view', () => {
    const lazy = image({ src: '/a.png', loading: 'lazy' });
    lazy.getBoundingClientRect = () => rectAt(100);
    expect(findPendingReason(pageWith(lazy), view)).toBe('image');
  });

  it('does not wait for a lazy image the browser will not load: below the fold, off to the side, or unrendered', () => {
    for (const rect of [rectAt(2000), rectAt(100, 3000), rectAt(-500), rectAt(0, 0, 0)]) {
      const lazy = image({ src: '/a.png', loading: 'lazy' });
      lazy.getBoundingClientRect = () => rect;
      expect(findPendingReason(pageWith(lazy), view)).toBeNull();
      document.body.innerHTML = '';
    }
  });
});

describe('waitForPageReady', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setInterval', 'clearInterval', 'setTimeout', 'clearTimeout', 'performance'],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is ready once the page has been quiet for a moment', async () => {
    const root = pageWith(document.createElement('p'));
    let outcome: string | undefined;
    void waitForPageReady({ root, view: () => view }).then((value) => (outcome = value));

    await vi.advanceTimersByTimeAsync(100);
    expect(outcome).toBeUndefined();
    await vi.advanceTimersByTimeAsync(200);
    expect(outcome).toBe('ready');
  });

  it('holds while something is pending, and finishes after it clears and the page settles', async () => {
    const marker = document.createElement('span');
    marker.setAttribute('data-page-pending', '');
    const root = pageWith(marker);
    let outcome: string | undefined;
    void waitForPageReady({ root, view: () => view }).then((value) => (outcome = value));

    await vi.advanceTimersByTimeAsync(3000);
    expect(outcome).toBeUndefined();

    marker.remove();
    await vi.advanceTimersByTimeAsync(100);
    expect(outcome).toBeUndefined();
    await vi.advanceTimersByTimeAsync(200);
    expect(outcome).toBe('ready');
  });

  it('starts the quiet period over whenever the DOM changes', async () => {
    const root = pageWith();
    let outcome: string | undefined;
    void waitForPageReady({ root, view: () => view }).then((value) => (outcome = value));

    await vi.advanceTimersByTimeAsync(150);
    root.append(document.createElement('section'));
    await vi.advanceTimersByTimeAsync(150);
    // 300ms in, but the page changed 150ms ago
    expect(outcome).toBeUndefined();
    await vi.advanceTimersByTimeAsync(150);
    expect(outcome).toBe('ready');
  });

  it('ignores attribute writes, which the hero makes on every frame', async () => {
    const root = pageWith(document.createElement('div'));
    const layer = root.firstElementChild as HTMLElement;
    let outcome: string | undefined;
    void waitForPageReady({ root, view: () => view }).then((value) => (outcome = value));

    for (let i = 0; i < 10; i += 1) {
      layer.style.transform = `translateX(${i}px)`;
      await vi.advanceTimersByTimeAsync(30);
    }
    expect(outcome).toBe('ready');
  });

  it('gives up waiting after the timeout instead of stranding the visitor', async () => {
    const marker = document.createElement('span');
    marker.setAttribute('data-page-pending', '');
    const root = pageWith(marker);
    const result = waitForPageReady({ root, timeoutMs: 2000, view: () => view });

    await vi.advanceTimersByTimeAsync(2100);
    await expect(result).resolves.toBe('timeout');
  });

  it('stops when aborted', async () => {
    const marker = document.createElement('span');
    marker.setAttribute('data-page-pending', '');
    const root = pageWith(marker);
    const controller = new AbortController();
    const result = waitForPageReady({ root, signal: controller.signal, view: () => view });

    await vi.advanceTimersByTimeAsync(500);
    controller.abort();
    await expect(result).resolves.toBe('aborted');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('is aborted at once when the signal was already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      waitForPageReady({ root: pageWith(), signal: controller.signal, view: () => view }),
    ).resolves.toBe('aborted');
  });
});
