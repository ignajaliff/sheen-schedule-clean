
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// A more flexible function that accepts a custom media query
export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => {
      setMatches(mql.matches)
    }
    mql.addEventListener("change", onChange)
    setMatches(mql.matches)
    return () => mql.removeEventListener("change", onChange)
  }, [query])

  return !!matches
}

// Create more specific hooks for common breakpoints
export function useIsSmallMobile() {
  return useMediaQuery("(max-width: 430px)")
}

export function useIsMediumMobile() {
  return useMediaQuery("(min-width: 431px) and (max-width: 639px)")
}

export function useIsLargeMobile() {
  return useMediaQuery("(min-width: 640px) and (max-width: 767px)")
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 768px)")
}
