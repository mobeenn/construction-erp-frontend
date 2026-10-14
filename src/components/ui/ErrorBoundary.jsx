import { Component } from "react";
import { ErrorState } from "./States";

export default class ErrorBoundary extends Component {
   constructor(props) {
      super(props);
      this.state = { error: null };
   }

   static getDerivedStateFromError(error) {
      return { error };
   }

   componentDidCatch(error, info) {
      console.error("UI error boundary:", error, info);
   }

   render() {
      if (this.state.error) {
         return (
            <div className="page-shell">
               <ErrorState
                  message={this.state.error.message || "Something went wrong in this view."}
                  onRetry={() => {
                     this.setState({ error: null });
                     window.location.reload();
                  }}
               />
            </div>
         );
      }
      return this.props.children;
   }
}
