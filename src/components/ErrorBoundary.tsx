import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log in dev environment, never show raw technical stack to end user
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-200/80 max-w-lg w-full flex flex-col items-center">
            <div className="w-16 h-16 bg-[#C8102E]/10 rounded-2xl flex items-center justify-center mb-6 text-[#C8102E]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[#063F3A] mb-3">
              Une interruption temporaire est survenue
            </h1>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-8">
              L'application a rencontré un imprévu lors du chargement de cette page. Vous pouvez recharger la page ou revenir à l'accueil de la plateforme.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                onClick={this.handleRetry}
                className="w-full sm:w-1/2 py-3 px-5 rounded-full bg-[#00843D] hover:bg-[#006830] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Réessayer
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-1/2 py-3 px-5 rounded-full bg-white hover:bg-stone-50 text-[#063F3A] border border-stone-300 font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
