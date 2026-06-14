"use client";

/**
 * react-router-dom compatibility shim built on top of Next.js navigation.
 *
 * This lets the components and pages that were written for React Router keep
 * their existing call-sites (`<Link to=...>`, `useNavigate`, `useLocation`,
 * `useSearchParams`, `useParams`, `NavLink`) while the app is served by the
 * Next.js App Router. New code should prefer `next/link` / `next/navigation`
 * directly.
 */

import NextLink from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from "next/navigation";
import {
  forwardRef,
  useEffect,
  useState,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";

type To = string;

interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: To;
  replace?: boolean;
  /** react-router supported router state; ignored under Next.js */
  state?: unknown;
  children?: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, replace, state: _state, ...props }, ref) => {
    return <NextLink ref={ref} href={to} replace={replace} {...props} />;
  },
);
Link.displayName = "Link";

export interface NavLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href" | "children"> {
  to: To;
  end?: boolean;
  className?:
    | string
    | ((state: { isActive: boolean; isPending: boolean }) => string);
  children?:
    | ReactNode
    | ((state: { isActive: boolean; isPending: boolean }) => ReactNode);
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ to, end, className, children, ...props }, ref) => {
    const pathname = usePathname();
    const isActive = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
    const state = { isActive, isPending: false };
    const resolvedClassName =
      typeof className === "function" ? className(state) : className;
    const resolvedChildren =
      typeof children === "function" ? children(state) : children;
    return (
      <NextLink ref={ref} href={to} className={resolvedClassName} {...props}>
        {resolvedChildren}
      </NextLink>
    );
  },
);
NavLink.displayName = "NavLink";

export function useNavigate() {
  const router = useRouter();
  return (to: To | number, options?: { replace?: boolean }) => {
    if (typeof to === "number") {
      if (to < 0) router.back();
      else router.forward();
      return;
    }
    if (options?.replace) router.replace(to);
    else router.push(to);
  };
}

export function useLocation() {
  const pathname = usePathname();
  // Read search/hash lazily on the client so this hook does not force the
  // whole tree (Navbar uses it on every page) out of static generation.
  const [extras, setExtras] = useState({ search: "", hash: "" });
  useEffect(() => {
    setExtras({ search: window.location.search, hash: window.location.hash });
  }, [pathname]);
  return {
    pathname,
    search: extras.search,
    hash: extras.hash,
    state: null as unknown,
    key: "default",
  };
}

type SetSearchParams = (
  next:
    | URLSearchParams
    | Record<string, string>
    | string
    | ((prev: URLSearchParams) => URLSearchParams | Record<string, string> | string),
  options?: { replace?: boolean },
) => void;

export function useSearchParams(): [URLSearchParams, SetSearchParams] {
  const router = useRouter();
  const pathname = usePathname();
  const nextParams = useNextSearchParams();
  const current = new URLSearchParams(nextParams?.toString() ?? "");

  const setSearchParams: SetSearchParams = (next, options) => {
    const resolved = typeof next === "function" ? next(current) : next;
    let params: URLSearchParams;
    if (resolved instanceof URLSearchParams) params = resolved;
    else if (typeof resolved === "string") params = new URLSearchParams(resolved);
    else params = new URLSearchParams(resolved as Record<string, string>);
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (options?.replace) router.replace(url);
    else router.push(url);
  };

  return [current, setSearchParams];
}

export function useParams<
  T extends Record<string, string | undefined> = Record<string, string | undefined>,
>(): T {
  return (useNextParams() ?? {}) as T;
}
