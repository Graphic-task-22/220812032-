import * as THREE from 'three';
const vector2=[
    new THREE.Vector2(200,0)
];
const curve =new THREE.QuadraticBezierCurve(...vector2);
const points=curve.getPoints(50);
const geometry=new THREE.BufferGeometry().setFromPoints(points);
const material=new THREE.LineBasicMaterial({color:0xff0000});
const curveObject =new THREE.Line(geometry,material);
const geometry2=new THREE.BufferGeometry().setFromPoints(vector2);
const material2=new THREE.PointsMaterial({color:0xffffff,size:5});
const points2=new THREE.Points(geometry2,material2);
curveObject.add(points2);
const line=new THREE.Line(geometry2,new THREE.LineBasicMaterial({color:0xfffffff}));
curveObject.add(line);
export default curveObject;