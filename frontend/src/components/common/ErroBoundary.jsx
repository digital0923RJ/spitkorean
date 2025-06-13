import { Component } from "react"

/**
 * Error Boundary to catch errors in translation components
 */
export class TranslationErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by Error Boundary:", error, errorInfo)

    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="text-red-500 text-sm p-2 border border-red-300 rounded">
          <p>Translation error. Showing original content.</p>
          <details className="mt-2">
            <summary className="cursor-pointer">Error details</summary>
            <pre className="text-xs mt-1 overflow-auto">{this.state.error?.message || "Unknown error"}</pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

export default TranslationErrorBoundary
