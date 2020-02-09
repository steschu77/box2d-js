class b2Vec2 {
  constructor(u0, u1) {
    this.u0 = u0;
    this.u1 = u1;
  }

  set(v) {
    this.u0 = v.u0;
    this.u1 = v.u1;
  }

  copy() {
    return new b2Vec2(this.u0, this.u1);
  }

  neg() {
    return new b2Vec2(-this.u0, -this.u1);
  }

  perpendicular() {
    return new b2Vec2(this.u1, -this.u0);
  }

  length() {
    return Math.sqrt(this.u0 * this.u0 + this.u1 * this.u1);
  }

  normalize() {
    const l = this.length();
    if (l < Number.MIN_VALUE) {
      return copy();
    }

    const invLength = 1.0 / length;
    const u0 = invLength * this.u0;
    const u1 = invLength * this.u1;
    return new b2Vec2(u0, u1);
  }
}

class b2Mat22 {
  constructor(v0, v1) {
    this.v0 = v0.copy();
    this.v1 = v1.copy();
  }

  set(m) {
    this.v0.set(m.v0);
    this.v1.set(m.v1);
  }

  copy() {
    return new b2Mat22(this.v0, this.v1);
  }

  invert() {
    const a = this.col1.x;
    const b = this.col2.x;
    const c = this.col1.y;
    const d = this.col2.y;
    const det = a * d - b * c;

    const invDet = 1.0 / det;
    let c1 = new b2Vec2(invDet * d, -invDet * c);
    let c2 = new b2Vec2(-invDet * b, invDet * a);
    return new b2Mat22(c1, c2);
  }
}

class b2Rot {
  constructor(s, c) {
    this.s = s;
    this.c = c;
  }

  copy() {
    return new b2Rot(this.s, this.c);
  }

  xAxis() {
    return new b2Vec2(this.c, this.s);
  }

  yAxis() {
    return new b2Vec2(-this.s, this.c);
  }
}

class b2Transform {
  constructor(p, q) {
    this.p = p.copy();
    this.q = q.copy();
  }
}

function b2Rotate(angle) {
  s = Math.sin(angle);
  c = Math.cos(angle);
  return new b2Rot(s, c);
}

function b2Dot(a, b) {
  return a.u0 * b.u0 + a.u1 * b.u1;
}

function b2Cross(a, b) {
  return a.u0 * b.u1 - a.u1 * b.u0;
}

function b2AddVV(a, b) {
  let u0 = a.x + b.x;
  let u1 = a.y + b.y;
  return new b2Vec2(u0, u1);
}

function b2SubVV(a, b) {
  let u0 = a.x - b.x;
  let u1 = a.y - b.y;
  return new b2Vec2(u0, u1);
}

function b2MulSV(s, a) {
  let u0 = s * a.x;
  let u1 = s * a.y;
  return new b2Vec2(u0, u1);
}

function b2MulMV(A, v) {
  let u0 = A.col1.x * v.x + A.col2.x * v.y;
  let u1 = A.col1.y * v.x + A.col2.y * v.y;
  return new b2Vec2(u0, u1);
}

function b2MulTMV(A, v) {
  let u0 = A.col1.x * v.x + A.col1.y * v.y;
  let u1 = A.col2.x * v.x + A.col2.y * v.y;
  return new b2Vec2(u0, u1);
}

function b2MulRV(q, a) {
  let u0 = q.c * a.x - q.s * a.y;
  let u1 = q.s * a.x + q.c * a.y;
  return new b2Vec2(u0, u1);
}

function b2MulTRV(q, a) {
  let u0 = q.c * a.x + q.s * a.y;
  let u1 = -q.s * a.x + q.c * a.y;
  return new b2Vec2(u0, u1);
}

function b2MulMM(A, B) {
}

function b2MulTMM(A, B) {
}

function b2MulRR(q, r) {
  let u0 = q.s * r.c + q.c * r.s;
  let u1 = q.c * r.c - q.s * r.s;
  return new b2Rot(u0, u1);
}

function b2MulTRR(q, r) {
  let u0 = q.c * r.s - q.s * r.c;
  let u1 = q.c * r.c + q.s * r.s;
  return new b2Rot(u0, u1);
}

function b2MulTTV(A, a) {
  let p = b2SubVV(a, A.p);
}

// v2 =  A.q.Rot(B.q.Rot(v1) + B.p) + A.p
//    = (A.q * B.q).Rot(v1) + A.q.Rot(B.p) + A.p
function b2MulTT(A, B) {
  let p = b2AddVV(b2MulRV(A.q, B.p), A.p);
  let q = b2MulRR(A.q, B.q);
  return new b2Transform(p, q);
}

// v2 = A.q' * (B.q * v1 + B.p - A.p)
//    = A.q' *  B.q * v1 + A.q' * (B.p - A.p)
function b2MulTTT(A, B) {
  let p = b2MulTRV(A.q, b2SubVV(B.p, A.p));
  let q = b2MulTRR(A.q, B.q);
  return new b2Transform(p, q);
}

module.exports = {
  b2Vec2,
  b2Dot,
  b2Cross
}
