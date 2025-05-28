export interface GameEvent<T = any> {
  type: string;
  timestamp: number;
  data?: T;
}

export type EventListener<T = any> = (event: GameEvent<T>) => void;

export interface EventSubscription {
  unsubscribe(): void;
}

export class EventManager {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private eventQueue: GameEvent[] = [];
  private isProcessing: boolean = false;
  private oneTimeListeners: Map<string, Set<EventListener>> = new Map();
  private wildcardListeners: Set<(event: GameEvent) => void> = new Set();

  on<T = any>(eventType: string, listener: EventListener<T>): EventSubscription {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(listener as EventListener);

    return {
      unsubscribe: () => this.off(eventType, listener)
    };
  }

  once<T = any>(eventType: string, listener: EventListener<T>): EventSubscription {
    if (!this.oneTimeListeners.has(eventType)) {
      this.oneTimeListeners.set(eventType, new Set());
    }

    this.oneTimeListeners.get(eventType)!.add(listener as EventListener);

    return {
      unsubscribe: () => this.offOnce(eventType, listener)
    };
  }

  onAny(listener: (event: GameEvent) => void): EventSubscription {
    this.wildcardListeners.add(listener);

    return {
      unsubscribe: () => this.wildcardListeners.delete(listener)
    };
  }

  off<T = any>(eventType: string, listener: EventListener<T>): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(listener as EventListener);
      if (listeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  private offOnce<T = any>(eventType: string, listener: EventListener<T>): void {
    const listeners = this.oneTimeListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener as EventListener);
      if (listeners.size === 0) {
        this.oneTimeListeners.delete(eventType);
      }
    }
  }

  emit<T = any>(eventType: string, data?: T): void {
    const event: GameEvent = {
      type: eventType,
      timestamp: Date.now(),
      data
    };

    this.processEvent(event);
  }


  queue<T = any>(eventType: string, data?: T): void {
    const event: GameEvent = {
      type: eventType,
      timestamp: Date.now(),
      data
    };

    this.eventQueue.push(event);
  }

  processQueue(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      this.processEvent(event);
    }

    this.isProcessing = false;
  }

  private processEvent(event: GameEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        }
        catch (error) {
          console.error(`Error in event listener for ${event.type}:`, error)
        }
      }
    }

    const oneTimeListeners = this.oneTimeListeners.get(event.type);
    if (oneTimeListeners) {
      for (const listener of oneTimeListeners) {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in one-time event listener for ${event.type}:`, error);
        }
      }
      this.oneTimeListeners.delete(event.type);
    }

    for (const listener of this.wildcardListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in wildcard event listener:`, error);
      }
    }
  }

  clear(): void {
    this.listeners.clear();
    this.oneTimeListeners.clear();
    this.wildcardListeners.clear();
    this.eventQueue = [];
  }

  getDebugInfo(): {
    activeListeners: number;
    queuedEvents: number;
    eventTypes: string[];
  } {
    const eventTypes = Array.from(this.listeners.keys());
    const activeListeners = Array.from(this.listeners.values())
      .reduce((sum, set) => sum + set.size, 0);

    return {
      activeListeners,
      queuedEvents: this.eventQueue.length,
      eventTypes
    };
  }
}

export const globalEventManager = new EventManager();

export const EventTypes = {
  // Entity events
  ENTITY_CREATED: 'entity:created',
  ENTITY_DESTROYED: 'entity:destroyed',
  COMPONENT_ADDED: 'component:added',
  COMPONENT_REMOVED: 'component:removed',

  // Game events
  GAME_START: 'game:start',
  GAME_PAUSE: 'game:pause',
  GAME_RESUME: 'game:resume',
  GAME_OVER: 'game:over',

  // Scene events
  SCENE_CHANGE: 'scene:change',
  SCENE_LOADED: 'scene:loaded',
  SCENE_UNLOADED: 'scene:unloaded',

  // Input events
  KEY_DOWN: 'input:keydown',
  KEY_UP: 'input:keyup',
  MOUSE_CLICK: 'input:mouseclick',
  MOUSE_MOVE: 'input:mousemove',

  // Collision events
  COLLISION_START: 'collision:start',
  COLLISION_END: 'collision:end',

  // Custom events
  PLAYER_DIED: 'player:died',
  SCORE_CHANGED: 'score:changed',
  LEVEL_COMPLETED: 'level:completed'
} as const;

export interface EntityEventData {
  entityId: number;
  componentType?: string;
}

export interface SceneEventData {
  previousScene?: string;
  newScene: string;
}

export interface InputEventData {
  key?: string;
  mouseX?: number;
  mouseY?: number;
  button?: number;
}

export interface CollisionEventData {
  entityA: number;
  entityB: number;
  point?: { x: number; y: number };
}

export function createEventData<T>(data: T): T {
  return { ...data };
}
