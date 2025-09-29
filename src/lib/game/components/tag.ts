import type { Component } from "../core/Component";

export enum TagType {
  PLAYER = 'player',
  WALL = 'wall',
  BALL = 'ball'

}

export class Tag implements Component {
  constructor(public type: TagType) { }
}
