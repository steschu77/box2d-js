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

class b2BoxDef {
  constructor(extents) {
    this.position = new b2Vec2(0.0, 0.0);
    this.rotation = 0.0;
    this.friction = 0.2;
    this.restitution = 0.0;
    this.extents = extents.copy();
  }
}

class b2MassData {
  constructor(mass, I) {
    this.mass = mass;
    this.I = I;
  }
}

class b2ClipVertex {
  constructor(id, v) {
    this.id = id;
    this.v = v;
  }
}

// ----------------------------------------------------------------------------
function b2Interp(v0, v1, t)
{
  let u0 = v0.u0 + t * (v1.u0 - v0.u0);
  let u1 = v0.u1 + t * (v1.u1 - v0.u1);
  return new b2Vec2(u0, u1);
}

// ----------------------------------------------------------------------------
function b2Distance(n, v, x)
{
  let u0 = n.u0 * (x.u0 - v.u0);
  let u1 = n.u1 * (x.u1 - v.u1);
  return u0 + u1;
}

// ----------------------------------------------------------------------------
function b2ClipSegmentToLine(cv, normal, vx, clipEdge) {

  var distance0 = b2Distance(normal, vx, cv[0].v);
  var distance1 = b2Distance(normal, vx, cv[1].v);

  if (distance0 > 0.0) {
    let t = distance0 / (distance0 - distance1);
    cv[0].v = b2Interp(cv[0].v, cv[1].v, t);
    cv[0].id.setInEdge1(clipEdge);
    cv[0].id.resetInEdge2();
  } else if (distance1 > 0.0) {
    let t = distance0 / (distance0 - distance1);
    cv[1].v = b2Interp(cv[0].v, cv[1].v, t);
    cv[1].id.setOutEdge1(clipEdge);
    cv[1].id.resetOutEdge2();
  }
}

// ----------------------------------------------------------------------------
function b2FindMaxSeparation(poly1, poly2, flip) {
  const count1 = poly1.vertexCount;
  const count2 = poly2.vertexCount;

  let maxSeparation = -Number.MAX_VALUE;
  for (var i = 0; i < count1; ++i) {
    const n = poly1.normals[i];
    const v1 = poly1.vertices[i];

    let si = Number.MAX_VALUE;
    for (var j = 0; j < count2; ++j) {
      const sij = b2Distance(n, v1, poly2.vertices[j]);
      if (sij < si) {
        si = sij;
      }
    }

    if (si > maxSeparation) {
      maxSeparation = si;
      bestIndex = i;
    }
  }

  return {
    poly1: poly1,
    poly2: poly2,
    maxSeparation: maxSeparation,
    index: bestIndex,
    flip: flip
  }
}

// ----------------------------------------------------------------------------
function b2FindIncidentEdge(refEdge) {

  const count2 = refEdge.poly2.vertexCount;
  const normal1 = refEdge.poly1.normals[refEdge.index];

  let minDot = Number.MAX_VALUE;
  let index = 0;
  for (var i = 0; i < count2; ++i) {
    const dot = b2math.b2Dot(normal1, poly2.normals[i]);
    if (dot < minDot) {
      minDot = dot;
      index = i;
    }
  }

  const i1 = index;
  const i2 = i1 + 1 < count2 ? i1 + 1 : 0;

  incEdge = [
    { v: vertices2[i1], id: { i0: edge1, i1: i1 } },
    { v: vertices2[i2], id: { i0: edge1, i1: i2 } }
  ];
  return incEdge;
}

// ----------------------------------------------------------------------------
function b2CollidePoly(arbiter, polyA, polyB) {

  const edgeA = b2FindMaxSeparation(polyA, polyB, 0);
  if (edgeA.maxSeparation > 0) {
    return;
  }

  const edgeB = b2FindMaxSeparation(polyB, polyA, 1);
  if (edgeB.maxSeparation > 0) {
    return;
  }

  const referenceEdge = edgeB.maxSeparation > edgeA.maxSeparation ? edgeB : edgeA;
  const incidentEdge = b2FindIncidentEdge(referenceEdge);

  const count1 = referenceEdge.poly1.vertexCount;
  const iv1 = referenceEdge.index;
  const iv2 = iv1 + 1 < count1 ? iv1 + 1 : 0;

  const vert1s = referenceEdge.poly1.vertices;
  const norm1s = referenceEdge.poly1.normals;
  const v11 = vert1s[iv1];
  const v12 = vert1s[iv2];
  const normal = norm1s[iv1];
  const tangent = normal.perpendicular().neg();

  b2ClipSegmentToLine(incidentEdge, tangent.neg(), v11, iv1);
  b2ClipSegmentToLine(incidentEdge, tangent, v12, iv2);

  let pointCount = 0;
  for (let i = 0; i < 2; ++i) {
    let separation = b2Distance(normal, v11, incidentEdge[i]);
    if (separation <= 0.0) {
      let cp = manifold.points[pointCount];
      cp.separation = separation;
      cp.position.SetV(clipPoints2[i].v);
      cp.normal.SetV(referenceEdge.flip ? normal.neg() : normal);
      cp.id.Set(referenceEdge.flip ? incidentEdge[i].id.neg() : incidentEdge[i].id);
      ++pointCount;
    }
  }

  manifold.pointCount = pointCount;
};
