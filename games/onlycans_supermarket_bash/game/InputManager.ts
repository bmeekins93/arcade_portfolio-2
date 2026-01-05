export class InputManager {
  keys: Record<string, any>;
  prev: Record<string, boolean>;
  curr: Record<string, boolean>;
  axisX: number;

  constructor(keys: Record<string, any>) {
    this.keys = keys;
    this.prev = {};
    this.curr = {};
    this.axisX = 0;
  }

  poll() {
    const actions = Object.keys(this.keys);

    for (const a of actions) {
      this.prev[a] = !!this.curr[a];
      this.curr[a] = !!this.keys[a].isDown;
    }

    const left = this.curr.left ? 1 : 0;
    const right = this.curr.right ? 1 : 0;
    this.axisX = right - left;
  }

  pressed(action: string) {
    return !!this.curr[action];
  }

  justPressed(action: string) {
    return !!this.curr[action] && !this.prev[action];
  }
}