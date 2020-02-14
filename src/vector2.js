export default class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  getX() {
    return this.x;
  }
  getY() {
    return this.y;
  }
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
  setVector(v) {
    return this.set(v.x, v.y);
  }
  add(x, y) {
    this.x += x;
    this.y += y;
    return this;
  }
  addVector(v) {
    return this.add(v.x, v.y);
  }
  sub(x, y) {
    return this.add(-x, -y);
  }
  subVector(v) {
    return this.sub(v.x, v.y);
  }
  scale(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }
  distanceSqr(v) {
    const deltaX = this.x - v.x;
    const deltaY = this.y - v.y;
    return deltaX * deltaX + deltaY * deltaY;
  }
  distance(v) {
    return Math.sqrt(this.distanceSqr(v));
  }
  angle() {
    return Math.atan2(this.y, this.x);
  }
  len2() {
    return this.x * this.x + this.y * this.y;
  }
  len() {
    return Math.sqrt(this.len2());
  }
  nor() {
    const len = this.len();
    if (len !== 0) {
      this.x /= len;
      this.y /= len;
    }
    return this;
  }
  rotateRad(rad) {
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const newX = this.x * cos - this.y * sin;
    const newY = this.x * sin + this.y * cos;

    this.x = newX;
    this.y = newY;

    return this;
  }
  rotate(degrees) {
    return this.rotateRad((degrees * Math.PI) / 180);
  }
}
