import { Component } from 'react';
import Button from './Button';
import Card from './Card';

class PageErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-semibold text-primary">This page hit a snag.</h2>
          <p className="mt-3 text-ink/65">Refresh the page or head back to the dashboard.</p>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => window.location.reload()}>Refresh page</Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary;
