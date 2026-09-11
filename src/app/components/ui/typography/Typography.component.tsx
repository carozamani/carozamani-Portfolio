import { PropsWithChildren, ReactElement } from "react";

import clsx from "clsx";



import styles from "./Typography.module.css";
import { ColorType } from "@/app/types/color.type";

type VariantType =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "subtitle1"
  | "subtitle2"
  | "body1"
  | "body2"
  | "caption"
  | "overline"
  | "button";

type TypographyColorType =
  | ColorType
  | "text-primary"
  | "text-secondary"
  | "text-disabled";

type Props = PropsWithChildren<{
  ellipsis?: boolean;
  variant: VariantType;
  color?: TypographyColorType;
  className?: string;
  id?: string;
}>;

export default function TypographyComponent({
  ellipsis = false,
  variant,
  color = "text-primary",
  className,
  id,
  children,
}: Props): ReactElement {
  return (
    <div
      id={id}
      className={clsx(
        styles.typography,
        ellipsis && styles.ellipsis,
        variant,
        color,
        styles[color],
        className,
      )}
    >
      {children}
    </div>
  );
}