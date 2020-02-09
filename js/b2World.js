// MIT License

// Copyright (c) 2019 Erin Catto

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// ----------------------------------------------------------------------------
class b2RigidBody {
  constructor(pos, rot, width, invMass, invI) {
    this.position = pos;
    this.rot = rot;
    this.width = width;
    this.invMass = invMass;
    this.invI = invI;
    this.friction = 0.2;
    this.restitution = 0.0;
    this.velocity = new b2Vec2(0, 0);
    this.angularVelocity = 0;
    this.force = new b2Vec2(0, 0);
    this.torque = 0;
  }

  applyImpulse(pt, P) {
    let r_u0 = pt.u0 - this.position.u0;
    let r_u1 = pt.u1 - this.position.u1;

    this.velocity.u0 += this.invMass * P.u0;
    this.velocity.u1 += this.invMass * P.u1;
    this.angularVelocity += this.invI * (r_u0 * P.u1 - r_u1 * P.u0);
  }

  integrateForces(dt) {
    this.velocity.u0 += dt * invMass * force.u0;
    this.velocity.u1 += dt * invMass * force.u1;
    this.angularVelocity += dt * invI * torque;
  }

  integrateVelocities(dt) {
    this.position.u0 += dt * velocity.u0;
    this.position.u1 += dt * velocity.u1;
    this.rotation += dt * angularVelocity;

    this.force.u0 = 0;
    this.force.u1 = 0;
    this.torque = 0;
  }

}

// ----------------------------------------------------------------------------
class b2Manifold {
  constructor() {
    this.points = [];
    this.pointCount = 0;
  }

  preStep() {
  }

  applyImpulse() {
  }
}

// ----------------------------------------------------------------------------
class b2World {
  constructor() {
    this.dynamicBodies = [];
    this.staticBodies = [];
    this.manifolds = [];
  }

  addDynamicBody(obj) {
    this.dynamicBodies.push(obj);
  }

  addStaticBody(obj) {
    this.staticBodies.push(obj);
  }

  step(dt) {
    this.collisionDetection();
    this.dynamicBodies.forEach(body => body.integrateForces());
    this.manifolds.forEach(manifold => manifold.preStep())
    for (let i = 0; i < 10; ++i) {
      this.manifolds.forEach(manifold => manifold.applyImpulse())
    }
    this.dynamicBodies.forEach(body => body.integrateVelocities());
  }

  collisionDetection() {

    // dynamic vs. dynamic
    for (let i = 0; i < this.dynamicBodies.length; ++i) {
      for (let j = i + 1; j < this.dynamicBodies.length; ++j) {
        collide(this.dynamicBodies[i], this.dynamicBodies[j]);
      }
    }

    // dynamic vs. static
    for (let i = 0; i < this.dynamicBodies.length; ++i) {
      for (let j = 0; j < this.staticBodies.length; ++j) {
        collide(this.dynamicBodies[i], this.staticBodies[j]);
      }
    }
  }

  collide(bodyA, bodyB) {
    let m = new b2Manifold();
    b2CollidePoly(m, bodyA, bodyB);
  }
}

// ----------------------------------------------------------------------------
function initWorld()
{
  return new b2World();
}
