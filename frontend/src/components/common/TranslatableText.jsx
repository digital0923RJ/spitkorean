///simplify solution

"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useLanguage } from "../../hooks/useLanguage.js"

/**
 * Automatically translatable text component
 * Translates in real-time based on the user's language settings
 */
const TranslatableText = ({
  children,
  className = "",
  fallback = "",
  as: Component = "span",
  context = "general",
  cached = true,
  onTranslated,
  ...props
}) => {
  const languageHook = useLanguage()

  // Safety check for the hook
  const {
    currentLanguage = "ko",
    translate,
    translateUIText,
    isTranslating: globalIsTranslating = false,
  } = languageHook || {}

  const [translatedText, setTranslatedText] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState(null)

  // Extract original text with safety checks
  const originalText = useMemo(() => {
    if (typeof children === "string") {
      return children
    }
    if (React.isValidElement(children) && typeof children.props?.children === "string") {
      return children.props.children
    }
    return fallback || ""
  }, [children, fallback])

  // Translation function with robust error handling
  useEffect(() => {
    const translateContent = async () => {
      // Initial safety checks
      if (!originalText.trim()) {
        setTranslatedText("")
        setError(null)
        return
      }

      if (currentLanguage === "ko") {
        setTranslatedText(originalText)
        setError(null)
        return
      }

      // Check if translation functions exist
      if (!translate && !translateUIText) {
        console.warn("Translation functions are not available")
        setTranslatedText(originalText)
        setError(null) // Not treated as an error, just use original text
        return
      }

      try {
        setIsTranslating(true)
        setError(null)

        let translated = originalText

        switch (context) {
          case "ui":
            if (typeof translateUIText === "function") {
              const result = await translateUIText({ text: originalText })
              translated = result?.text || originalText
            }
            break

          case "feedback":
          case "general":
          default:
            if (typeof translate === "function") {
              translated = await translate(originalText, currentLanguage, "ko")
            }
            break
        }

        setTranslatedText(translated || originalText)

        // Callback when translation completes
        if (onTranslated && typeof onTranslated === "function") {
          onTranslated(translated || originalText, originalText)
        }
      } catch (err) {
        console.error("Translation error:", err)
        const errorMessage = err instanceof Error ? err.message : "Unknown translation error"
        setError(errorMessage)
        setTranslatedText(originalText) // Fallback to original text
      } finally {
        setIsTranslating(false)
      }
    }

    translateContent()
  }, [originalText, currentLanguage, context, translate, translateUIText, onTranslated])

  // CSS classes with safety checks
  const loadingClass = isTranslating || globalIsTranslating ? "opacity-75 animate-pulse" : ""
  const errorClass = error ? "text-red-500" : ""
  const combinedClassName = [className, loadingClass, errorClass].filter(Boolean).join(" ")

  return (
    <Component className={combinedClassName} title={error ? `Translation error: ${error}` : undefined} {...props}>
      {translatedText || originalText || fallback}
    </Component>
  )
}

/**
 * Inline translation component (short texts)
 */
export const T = ({ children, ...props }) => (
  <TranslatableText as="span" {...props}>
    {children}
  </TranslatableText>
)

/**
 * Translation component for UI texts (buttons, menus, etc.)
 */
export const TUI = ({ children, ...props }) => (
  <TranslatableText as="span" context="ui" {...props}>
    {children}
  </TranslatableText>
)

/**
 * Translation component for learning feedback
 */
export const TFeedback = ({ children, ...props }) => (
  <TranslatableText as="div" context="feedback" {...props}>
    {children}
  </TranslatableText>
)

/**
 * Block-level translation component (long texts)
 */
export const TBlock = ({ children, as = "div", ...props }) => (
  <TranslatableText as={as} {...props}>
    {children}
  </TranslatableText>
)

/**
 * Conditional translation component
 */
export const TConditional = ({ children, condition = true, fallbackText = "", ...props }) => {
  if (!condition) {
    return fallbackText || children
  }

  return <TranslatableText {...props}>{children}</TranslatableText>
}

/**
 * Lazy translation component (on demand)
 */
export const TLazy = ({ children, trigger = "hover", className = "", ...props }) => {
  const [shouldTranslate, setShouldTranslate] = useState(false)

  const handleTrigger = () => {
    if (!shouldTranslate) {
      setShouldTranslate(true)
    }
  }

  const triggerProps = {
    [trigger === "hover" ? "onMouseEnter" : trigger === "focus" ? "onFocus" : "onClick"]: handleTrigger,
  }

  if (!shouldTranslate) {
    return (
      <span {...triggerProps} className={`cursor-pointer ${className}`} {...props}>
        {children}
      </span>
    )
  }

  return (
    <TranslatableText className={className} {...props}>
      {children}
    </TranslatableText>
  )
}

export default TranslatableText
