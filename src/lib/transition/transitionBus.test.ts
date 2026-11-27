import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerTransitionRunner, runTransition } from './transitionBus';

describe('transitionBus', () => {
  const cleanups: Array<() => void> = [];
  afterEach(() => {
    cleanups.splice(0).forEach((cleanup) => cleanup());
  });

  it('declines when nothing is registered', () => {
    const start = vi.fn();
    expect(runTransition(start)).toBe(false);
    expect(start).not.toHaveBeenCalled();
  });

  it('hands the change to the registered runner', () => {
    const start = vi.fn();
    const runner = vi.fn(() => true);
    cleanups.push(registerTransitionRunner(runner));

    expect(runTransition(start)).toBe(true);
    expect(runner).toHaveBeenCalledWith(start);
  });

  it('passes on a runner that declines', () => {
    cleanups.push(registerTransitionRunner(() => false));
    expect(runTransition(vi.fn())).toBe(false);
  });

  it('stops declining to play once the runner is unregistered', () => {
    const unregister = registerTransitionRunner(() => true);
    unregister();
    expect(runTransition(vi.fn())).toBe(false);
  });

  it('keeps a newer runner when an older one unregisters late', () => {
    const unregisterOld = registerTransitionRunner(() => false);
    cleanups.push(registerTransitionRunner(() => true));
    unregisterOld();
    expect(runTransition(vi.fn())).toBe(true);
  });
});
