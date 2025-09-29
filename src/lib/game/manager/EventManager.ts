export interface GameEvent<T = any> {
  type: string;
  data?: T;
}

export type EventListener<T = any> = (data?: T) => void;

export class EventManager {
  private listeners: Map<string, Set<EventListener>> = new Map();

  // Subscribe to an event
  on<T = any>(eventType: string, listener: EventListener<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(listener as EventListener);

    // Return unsubscribe function
    return () => this.off(eventType, listener);
  }

  // Unsubscribe from an event
  off<T = any>(eventType: string, listener: EventListener<T>): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(listener as EventListener);
      if (listeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  // Emit an event
  emit<T = any>(eventType: string, data?: T): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      }
    }
  }

  // Clear all listeners
  clear(): void {
    this.listeners.clear();
  }

  // Get debug info
  getListenerCount(eventType?: string): number {
    if (eventType) {
      return this.listeners.get(eventType)?.size || 0;
    }
    return Array.from(this.listeners.values())
      .reduce((sum, set) => sum + set.size, 0);
  }
}

export const globalEventManager = new EventManager();

// Common event types
export const EventTypes = {
  // Game events
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_OVER: 'game:over',

  // Scene events
  SCENE_CHANGE: 'scene:change',
  SCENE_LOADED: 'scene:loaded',
  SCENE_UNLOADED: 'scene:unloaded',

  // Player events
  PLAYER_DIED: 'player:died',
  SCORE_CHANGED: 'score:changed',

  // Input events (if you want to use events instead of direct input)
  PLAYER_MOVE: 'player:move',
  PLAYER_STOP: 'player:stop'
} as const;

