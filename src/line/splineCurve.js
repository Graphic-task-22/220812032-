import * as THREE from 'three';
const vector2=[
    new THREE.Vector2(0,0),
    new THREE.Vector2(100,100),
    new THREE.Vector2(200,0),
    //new THREE.Vector2(50,50),
    //new THREE.Vector2(0,100)
]
const curve =new THREE.SplineCurve(vector2);
const points=curve.getPoints(20);
const geometry=new THREE.BufferGeometry().setFromPoints(points);
const material=new THREE.LineBasicMaterial({color:0xff0000});
const SplineCurve =new THREE.Line(geometry,material);
const points2=new THREE.Points(geometry,new THREE.PointsMaterial({color:0x00ff00,size:2}));

const geometry2=new THREE.BufferGeometry().setFromPoints(points);
const material2=new THREE.LineBasicMaterial({color:0xff0000,size:2});
const points3=new THREE.Points(geometry2,material2);
SplineCurve.add(points2);
SplineCurve.add(points3);

export default SplineCurve;