import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface State {
  error: Error | null;
}

/** Global error boundary for stream/API failures. */
export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[TollGrid] uncaught UI error", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="panel-hard m-6 space-y-3 p-6">
          <p className="mono-caps text-destructive">Interface fault</p>
          <h2 className="text-xl">A panel crashed</h2>
          <p className="text-sm text-muted-foreground">
            The stream or API layer returned something unexpected. Reload the panel to continue —
            counting continues on the edge device.
          </p>
          <pre className="max-w-full overflow-x-auto border-2 border-border bg-surface-2 p-3 font-mono text-[11px] text-muted-foreground">
            {this.state.error.message}
          </pre>
          <Button onClick={() => this.setState({ error: null })}>Reload panel</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
