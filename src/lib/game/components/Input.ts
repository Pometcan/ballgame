import type { Component } from "../core/Component";

export class Input implements Component {
  keys: Set<string> = new Set();

  isPressed(key: string): boolean {
    return this.keys.has(key);
  }
}
