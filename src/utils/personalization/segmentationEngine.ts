import { UserSegment, BehaviorSignal } from '@/types/personalization';

interface SegmentCriteria {
  segment: UserSegment;
  name: string;
  description: string;
  evaluate: (behaviors: BehaviorSignal[]) => boolean;
}

class SegmentationEngine {
  private segmentCriteria: SegmentCriteria[] = [
    {
      segment: 'new_visitor',
      name: 'New Visitor',
      description: 'First-time visitors with minimal interaction',
      evaluate: (behaviors) => {
        const uniqueSessions = new Set(behaviors.map((b) => b.sessionId)).size;
        const pageViews = behaviors.filter((b) => b.type === 'page_view').length;
        return uniqueSessions === 1 && pageViews <= 5;
      },
    },
    {
      segment: 'returning_visitor',
      name: 'Returning Visitor',
      description: 'Visitors who have returned after initial visit',
      evaluate: (behaviors) => {
        const uniqueSessions = new Set(behaviors.map((b) => b.sessionId)).size;
        const pageViews = behaviors.filter((b) => b.type === 'page_view').length;
        return uniqueSessions >= 2 && pageViews >= 6 && pageViews < 20;
      },
    },
    {
      segment: 'frequent_reader',
      name: 'Frequent Reader',
      description: 'Highly engaged users who visit frequently',
      evaluate: (behaviors) => {
        const uniqueSessions = new Set(behaviors.map((b) => b.sessionId)).size;
        const pageViews = behaviors.filter((b) => b.type === 'page_view').length;
        const avgTimeOnPage = this.getAverageTimeOnPage(behaviors);
        return uniqueSessions >= 7 && pageViews >= 20 && avgTimeOnPage > 60000;
      },
    },
    {
      segment: 'content_creator',
      name: 'Content Creator',
      description: 'Users who create and manage content',
      evaluate: (behaviors) => {
        const daysActive = this.getDaysActive(behaviors);
        const pageViews = behaviors.filter((b) => b.type === 'page_view').length;
        return daysActive >= 30 && pageViews >= 50;
      },
    },
    {
      segment: 'engaged_user',
      name: 'Engaged User',
      description: 'Users who actively interact with content',
      evaluate: (behaviors) => {
        const bookmarks = behaviors.filter((b) => b.type === 'bookmark').length;
        const pageViews = behaviors.filter((b) => b.type === 'page_view').length;
        return bookmarks >= 5 && pageViews >= 15;
      },
    },
    {
      segment: 'dormant_user',
      name: 'Dormant User',
      description: 'Users who have not visited recently',
      evaluate: (behaviors) => {
        if (behaviors.length === 0) return false;
        const lastActive = behaviors[behaviors.length - 1].timestamp;
        const daysSinceActive = (Date.now() - lastActive) / (1000 * 60 * 60 * 24);
        return daysSinceActive > 14;
      },
    },
  ];

  evaluateSegment(behaviors: BehaviorSignal[]): UserSegment {
    for (const criteria of this.segmentCriteria) {
      if (criteria.evaluate(behaviors)) {
        return criteria.segment;
      }
    }
    return 'new_visitor';
  }

  getSegmentInfo(segment: UserSegment): SegmentCriteria | undefined {
    return this.segmentCriteria.find((c) => c.segment === segment);
  }

  getAllSegments(): SegmentCriteria[] {
    return this.segmentCriteria;
  }

  predictNextSegment(behaviors: BehaviorSignal[]): UserSegment | null {
    const currentSegment = this.evaluateSegment(behaviors);
    
    if (currentSegment === 'new_visitor') {
      const pageViews = behaviors.filter((b) => b.type === 'page_view').length;
      if (pageViews > 5) return 'returning_visitor';
    }

    if (currentSegment === 'returning_visitor') {
      const bookmarks = behaviors.filter((b) => b.type === 'bookmark').length;
      const pageViews = behaviors.filter((b) => b.type === 'page_view').length;
      if (bookmarks >= 5 && pageViews >= 15) return 'engaged_user';
      
      const uniqueSessions = new Set(behaviors.map((b) => b.sessionId)).size;
      if (uniqueSessions >= 7 && pageViews >= 20) return 'frequent_reader';
    }

    if (currentSegment === 'engaged_user') {
      const daysActive = this.getDaysActive(behaviors);
      const pageViews = behaviors.filter((b) => b.type === 'page_view').length;
      if (daysActive >= 30 && pageViews >= 50) return 'content_creator';
      
      const uniqueSessions = new Set(behaviors.map((b) => b.sessionId)).size;
      if (uniqueSessions >= 7 && pageViews >= 20) return 'frequent_reader';
    }

    return null;
  }

  getSegmentTransitionPath(from: UserSegment, to: UserSegment): UserSegment[] {
    const path: UserSegment[] = [];
    const segments: UserSegment[] = ['new_visitor', 'returning_visitor', 'engaged_user', 'frequent_reader', 'content_creator'];
    
    const fromIndex = segments.indexOf(from);
    const toIndex = segments.indexOf(to);

    if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
      return [];
    }

    for (let i = fromIndex; i <= toIndex; i++) {
      path.push(segments[i]);
    }

    return path;
  }

  private getAverageTimeOnPage(behaviors: BehaviorSignal[]): number {
    const timeOnPageSignals = behaviors.filter((b) => b.type === 'time_on_page' && b.value);
    if (timeOnPageSignals.length === 0) return 0;
    
    const total = timeOnPageSignals.reduce((sum, b) => sum + (b.value || 0), 0);
    return total / timeOnPageSignals.length;
  }

  private getDaysActive(behaviors: BehaviorSignal[]): number {
    const days = new Set(behaviors.map((b) => {
      const date = new Date(b.timestamp);
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }));
    return days.size;
  }
}

export const segmentationEngine = new SegmentationEngine();
export default segmentationEngine;
