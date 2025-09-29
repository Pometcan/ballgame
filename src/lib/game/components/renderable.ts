import type { Component } from "../core/Component"

export interface Renderable extends Component {
  zIndex: number;
  visible: boolean;
}
