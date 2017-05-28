"use strict";

// useful mathematic constants
var PI = Math.PI;

var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    RATIO = WIDTH / HEIGHT;

// camera, scene and renderer
var FIELDVIEW = 60,
    NEAR = 1,
    FAR = 5000,
    CAMERA = new THREE.PerspectiveCamera(FIELDVIEW, RATIO, NEAR, FAR),
    SCENE = new THREE.Scene(),
    RENDERER = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });

RENDERER.setSize(WIDTH, HEIGHT);

document.querySelector("#world").appendChild(RENDERER.domElement);

// render the scene
window.onresize = function () {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    RATIO = WIDTH / HEIGHT;

    RENDERER.setSize(WIDTH, HEIGHT);

    CAMERA.aspect = RATIO;
    CAMERA.updateProjectionMatrix();
};

function loop() {
    render();
    requestAnimationFrame(loop);
}

function render() {
    RENDERER.render(SCENE, CAMERA);
}

// camera
CAMERA.position.set(0, 250, 500);
CAMERA.lookAt(new THREE.Vector3(0, 0, 0));

// lights
function createLights() {
    var hemisphereLight = new THREE.HemisphereLight(0xffffff);

    SCENE.add(hemisphereLight);
}

// materials
var primaryMat = new THREE.MeshLambertMaterial({
    color: 0xdddddd,
    shading: THREE.FlatShading
});

var secondaryMat = new THREE.MeshLambertMaterial({
    color: 0xcccccc,
    shading: THREE.FlatShading
});

var tertiaryMat = new THREE.MeshLambertMaterial({
    color: 0xaaaaaa,
    shading: THREE.FlatShading
});

var quaternaryMat = new THREE.MeshLambertMaterial({
    color: 0x888888,
    shading: THREE.FlatShading
});

// let's draw the Millennium Falcon!
var boosters = [];

function createBody() {
    var halfBodies = new THREE.Object3D();

    var halfBodyHeight = 10;
    var halfBodyRad = 100;
    var halfBodyAngle = PI / 8;
    var halfBodySegments = 32;

    var halfBodyGeometry = new THREE.CylinderGeometry(halfBodyRad, halfBodyRad, halfBodyHeight, halfBodySegments, 1, false, halfBodyAngle, PI - halfBodyAngle);

    halfBodyGeometry.vertices[halfBodySegments * 2 + 2].setY(halfBodyHeight * 2);
    halfBodyGeometry.vertices[halfBodySegments * 2 + 3].setY(-halfBodyHeight * 2);

    closeHalfCylinder(halfBodyGeometry, halfBodySegments);

    halfBodyGeometry.applyMatrix(new THREE.Matrix4().makeRotationY(-halfBodyAngle / 2));

    var halfBody1 = new THREE.Mesh(halfBodyGeometry, primaryMat);

    halfBody1.material.side = THREE.DoubleSide;
    halfBodies.add(halfBody1);

    var halfBody2 = halfBody1.clone();
    halfBody2.rotation.y = PI;
    halfBodies.add(halfBody2);

    var bodyBack = new THREE.Object3D();

    var bodyBackTopGeometry = new THREE.CylinderGeometry(halfBodyRad + 5, halfBodyRad + 5, 2, halfBodySegments, 1, false, PI / 2, PI - PI / 2);

    bodyBackTopGeometry.vertices[halfBodySegments * 2 + 2].setY(halfBodyHeight * 1.5);
    bodyBackTopGeometry.vertices[0].setX(halfBodyRad - 5);
    bodyBackTopGeometry.vertices[halfBodySegments + 1].setX(halfBodyRad - 5);
    bodyBackTopGeometry.vertices[halfBodySegments].setZ(-(halfBodyRad - 5));
    bodyBackTopGeometry.vertices[halfBodySegments * 2 + 1].setZ(-(halfBodyRad - 5));

    closeHalfCylinder(bodyBackTopGeometry, halfBodySegments);

    bodyBackTopGeometry.applyMatrix(new THREE.Matrix4().makeRotationY(-PI / 4));

    var bodyBackTop = new THREE.Mesh(bodyBackTopGeometry, secondaryMat);

    bodyBackTop.material.side = THREE.DoubleSide;
    bodyBackTop.position.y = 5;

    bodyBack.add(bodyBackTop);

    var bodyBackBottom = bodyBackTop.clone();
    bodyBackBottom.rotation.x = PI;
    bodyBackBottom.position.y = -5;
    bodyBack.add(bodyBackBottom);

    bodyBack.rotation.y = PI;

    halfBodies.add(bodyBack);

    var boosterHaloMaterial = haloMaterial(0x00e3fc);

    var bodyBackAngle = PI / 2;
    var arcLength = bodyBackAngle * halfBodyRad;
    var boosterWidth = 8;
    var nbBooster = Math.round(arcLength / boosterWidth);
    var boosterAngle = bodyBackAngle / nbBooster;

    var boosterGeometry = new THREE.BoxGeometry(boosterWidth, 6, 5);
    var boosterHaloGeom = new THREE.BoxGeometry(boosterWidth + 15, 6, 10);

    var booster = new THREE.Mesh(boosterGeometry, new THREE.MeshLambertMaterial({
        color: 0xffffff
    }));

    var boosterHalo = new THREE.Mesh(boosterHaloGeom, boosterHaloMaterial);

    for (var i = -nbBooster / 2 + 1; i < nbBooster / 2; i++) {
        var bA = i * boosterAngle;

        var b = booster.clone();
        var h = boosterHalo.clone();

        b.position.x = h.position.x = -Math.cos(bA) * halfBodyRad;
        b.position.z = h.position.z = Math.sin(bA) * halfBodyRad;
        b.rotation.y = h.rotation.y = bA;

        halfBodies.add(b);
        halfBodies.add(h);

        boosters.push(h);
    }

    return halfBodies;
}

function createRescueCapsules() {
    var rescueCapsules = new THREE.Object3D();
    var rescueCapsuleLeft = new THREE.Object3D();

    var rescueCapsuleHeight = 92;
    var rescueCapsuleTopRad = 18;
    var rescueCapsuleBottomRad = rescueCapsuleTopRad + 2;
    var rescueCapsuleSegments = 6;
    var rescueCapsuleGeometry = new THREE.CylinderGeometry(rescueCapsuleTopRad, rescueCapsuleBottomRad, rescueCapsuleHeight, rescueCapsuleSegments);

    rescueCapsuleGeometry.applyMatrix(new THREE.Matrix4().makeRotationY(PI / rescueCapsuleSegments));

    var rescueCapsule = new THREE.Mesh(rescueCapsuleGeometry, tertiaryMat);

    rescueCapsuleLeft.add(rescueCapsule);

    var rescueCapsuleFront = new THREE.Object3D();

    var rescueCapsuleFrontHeight = 100 - rescueCapsuleHeight;
    var rescueCapsuleFrontBorderHeight = 2;
    var rescueCapsuleFrontBodyHeight = rescueCapsuleFrontHeight - rescueCapsuleFrontBorderHeight;

    var rescueCapsuleFrontBodyTopRad = rescueCapsuleTopRad - 6;
    var rescueCapsuleFrontBodyBottomRad = rescueCapsuleTopRad - 3;
    var rescueCapsuleFrontBodyGeometry = new THREE.CylinderGeometry(rescueCapsuleFrontBodyTopRad, rescueCapsuleFrontBodyBottomRad, rescueCapsuleFrontBodyHeight, 32);

    var rescueCapsuleFrontBody = new THREE.Mesh(rescueCapsuleFrontBodyGeometry, secondaryMat);

    rescueCapsuleFront.add(rescueCapsuleFrontBody);

    var rescueCapsuleFrontBorderGeometry = new THREE.CylinderGeometry(rescueCapsuleFrontBodyTopRad, rescueCapsuleFrontBodyTopRad, rescueCapsuleFrontBorderHeight, 32);

    var rescueCapsuleFrontBorder = new THREE.Mesh(rescueCapsuleFrontBorderGeometry, primaryMat);

    rescueCapsuleFrontBorder.position.y = rescueCapsuleFrontHeight / 2;

    rescueCapsuleFront.add(rescueCapsuleFrontBorder);
    rescueCapsuleFront.position.y = (rescueCapsuleHeight + rescueCapsuleFrontBodyHeight) / 2;

    rescueCapsuleLeft.add(rescueCapsuleFront);
    rescueCapsuleLeft.rotation.x = -PI / 2;
    rescueCapsuleLeft.position.z = -rescueCapsuleHeight / 2;

    rescueCapsules.add(rescueCapsuleLeft);

    var rescueCapsuleRight = rescueCapsuleLeft.clone();
    rescueCapsuleRight.rotation.x = PI / 2;
    rescueCapsuleRight.position.z = rescueCapsuleHeight / 2;
    rescueCapsules.add(rescueCapsuleRight);

    return rescueCapsules;
}

var shooterTop = null,
    shooterBottom = null;

function createCenterCylinder() {
    var center = new THREE.Object3D();

    var centerCylinderRad = 20;
    var centerCylinderHeight = 40;
    var centerCylinderGeometry = new THREE.CylinderGeometry(centerCylinderRad, centerCylinderRad, centerCylinderHeight, 32);

    var centerCylinder = new THREE.Mesh(centerCylinderGeometry, secondaryMat);

    center.add(centerCylinder);

    var blasterTop = new THREE.Object3D();
    var blasterTopBase = new THREE.Object3D();

    var blasterTopBaseHeight = 12;
    var blasterTopBaseWidth = 16;
    var blasterTopBaseX = blasterTopBaseWidth / 4;
    var blasterTopBaseDepth = 2;

    var blasterTopBaseBackHeight = 4;

    var blasterTopBaseBackGeometry = new THREE.BoxGeometry(blasterTopBaseWidth, blasterTopBaseBackHeight, blasterTopBaseDepth);

    blasterTopBaseBackGeometry.vertices[2].setX(blasterTopBaseX);
    blasterTopBaseBackGeometry.vertices[3].setX(blasterTopBaseX);
    blasterTopBaseBackGeometry.vertices[6].setX(-blasterTopBaseX);
    blasterTopBaseBackGeometry.vertices[7].setX(-blasterTopBaseX);

    var blasterTopBaseBack = new THREE.Mesh(blasterTopBaseBackGeometry, primaryMat);

    blasterTopBaseBack.position.y = -blasterTopBaseBackHeight / 2;
    blasterTopBase.add(blasterTopBaseBack);

    var blasterTopBaseFrontHeight = blasterTopBaseHeight - blasterTopBaseBackHeight;

    var blasterTopBaseFrontGeometry = new THREE.BoxGeometry(blasterTopBaseWidth, blasterTopBaseFrontHeight, blasterTopBaseDepth);

    blasterTopBaseFrontGeometry.vertices[0].setX(blasterTopBaseX);
    blasterTopBaseFrontGeometry.vertices[1].setX(blasterTopBaseX);
    blasterTopBaseFrontGeometry.vertices[4].setX(-blasterTopBaseX);
    blasterTopBaseFrontGeometry.vertices[5].setX(-blasterTopBaseX);

    var blasterTopBaseFront = new THREE.Mesh(blasterTopBaseFrontGeometry, primaryMat);

    blasterTopBaseFront.position.y = blasterTopBaseFrontHeight / 2;
    blasterTopBase.add(blasterTopBaseFront);
    blasterTop.add(blasterTopBase);

    var blasterTopCylinderQuarterRad = 4;
    var blasterTopCylinderQuarterHeight = 6;
    var blasterTopCylinderQuarterGeometry = new THREE.CylinderGeometry(blasterTopCylinderQuarterRad, blasterTopCylinderQuarterRad, blasterTopCylinderQuarterHeight, 32, 1, false, PI, PI / 2);

    for (var i = 0; i <= 32; i++) {
        blasterTopCylinderQuarterGeometry.vertices[i].setY(-Math.sin(PI / 12) * blasterTopCylinderQuarterGeometry.vertices[i].z + 1);

        blasterTopCylinderQuarterGeometry.vertices[i + 33].setY(Math.sin(PI / 12) * blasterTopCylinderQuarterGeometry.vertices[i + 33].z - 1);
    }

    closeHalfCylinder(blasterTopCylinderQuarterGeometry, 32);

    blasterTopCylinderQuarterGeometry.applyMatrix(new THREE.Matrix4().makeRotationY(PI));
    blasterTopCylinderQuarterGeometry.applyMatrix(new THREE.Matrix4().makeRotationZ(-PI / 2));

    var blasterTopCylinderQuarter = new THREE.Mesh(blasterTopCylinderQuarterGeometry, tertiaryMat);

    blasterTopCylinderQuarter.material.side = THREE.DoubleSide;
    blasterTopCylinderQuarter.position.y = blasterTopBaseFrontHeight - 4;
    blasterTopCylinderQuarter.position.z = blasterTopBaseDepth / 2;

    blasterTop.add(blasterTopCylinderQuarter);

    var blasterTopGuns = new THREE.Object3D();

    var blasterTopGunRad = .5;
    var blasterTopGunHeight = 5;
    var blasterTopGunGeometry = new THREE.CylinderGeometry(blasterTopGunRad, blasterTopGunRad, blasterTopGunHeight, 32);

    var blasterTopGunLeft = new THREE.Mesh(blasterTopGunGeometry, tertiaryMat);

    blasterTopGunLeft.position.set(-(blasterTopGunRad + .5), blasterTopGunHeight / 2 + blasterTopBaseFrontHeight - 4, blasterTopBaseDepth + blasterTopCylinderQuarterRad / 2 - blasterTopGunRad * 2);

    blasterTopGuns.add(blasterTopGunLeft);

    var blasterTopGunRight = blasterTopGunLeft.clone();
    blasterTopGunRight.position.set(blasterTopGunRad + .5, blasterTopGunHeight / 2 + blasterTopBaseFrontHeight - 4, blasterTopBaseDepth + blasterTopCylinderQuarterRad / 2 - blasterTopGunRad * 2);
    blasterTopGuns.add(blasterTopGunRight);

    var blasterTopGunShooterRad = .3;
    var blasterTopGunShooterHeight = 10;
    var blasterTopGunShooterGeometry = new THREE.CylinderGeometry(blasterTopGunShooterRad, blasterTopGunShooterRad, blasterTopGunShooterHeight, 32);

    var blasterTopGunShooterLeft = new THREE.Mesh(blasterTopGunShooterGeometry, tertiaryMat);

    blasterTopGunShooterLeft.position.set(-(blasterTopGunRad + .5), blasterTopGunShooterHeight / 2 + blasterTopBaseFrontHeight - 4 + blasterTopGunHeight, blasterTopBaseDepth + blasterTopCylinderQuarterRad / 2 - blasterTopGunRad * 2);

    blasterTopGuns.add(blasterTopGunShooterLeft);

    var blasterTopGunShooterRight = blasterTopGunShooterLeft.clone();
    blasterTopGunShooterRight.position.set(blasterTopGunRad + .5, blasterTopGunShooterHeight / 2 + blasterTopBaseFrontHeight - 4 + blasterTopGunHeight, blasterTopBaseDepth + blasterTopCylinderQuarterRad / 2 - blasterTopGunRad * 2);
    blasterTopGuns.add(blasterTopGunShooterRight);

    blasterTop.add(blasterTopGuns);

    blasterTop.applyMatrix(new THREE.Matrix4().makeRotationY(-PI / 2));
    blasterTop.applyMatrix(new THREE.Matrix4().makeRotationZ(-PI / 2));

    blasterTop.position.y = centerCylinderHeight / 2;

    center.add(blasterTop);

    var blasterBottom = blasterTop.clone();
    blasterBottom.rotation.x = PI / 2;
    blasterBottom.position.y = -centerCylinderHeight / 2;
    center.add(blasterBottom);

    // used to animate shoot
    shooterTop = blasterTop;
    shooterBottom = blasterBottom;

    return center;
}

function createBackCylinders() {
    var backCylinders = new THREE.Object3D();

    var backCylinderGeometry = new THREE.CylinderGeometry(8, 9, 2, 32);

    backCylinderGeometry.applyMatrix(new THREE.Matrix4().makeRotationZ(PI / 22));

    var backCylinder = new THREE.Mesh(backCylinderGeometry, quaternaryMat);

    backCylinder.position.x = -40;
    backCylinder.position.y = 15;
    backCylinders.add(backCylinder);

    var backCylinderLeft = backCylinder.clone();
    backCylinderLeft.rotation.x = -PI / 50;
    backCylinderLeft.position.x = -34;
    backCylinderLeft.position.y = 15;
    backCylinderLeft.position.z = -17;
    backCylinders.add(backCylinderLeft);

    var backCylinderRight = backCylinder.clone();
    backCylinderRight.rotation.x = PI / 50;
    backCylinderRight.position.x = -34;
    backCylinderRight.position.y = 15;
    backCylinderRight.position.z = 17;
    backCylinders.add(backCylinderRight);

    var _backCylinder = backCylinder.clone();
    _backCylinder.position.x = -60;
    _backCylinder.position.y = 12;
    backCylinders.add(_backCylinder);

    var _backCylinderLeft = backCylinder.clone();
    _backCylinderLeft.rotation.x = -PI / 50;
    _backCylinderLeft.position.x = -52;
    _backCylinderLeft.position.y = 12;
    _backCylinderLeft.position.z = -25;
    backCylinders.add(_backCylinderLeft);

    var _backCylinderRight = backCylinder.clone();
    _backCylinderRight.rotation.x = PI / 50;
    _backCylinderRight.position.x = -52;
    _backCylinderRight.position.y = 12;
    _backCylinderRight.position.z = 25;
    backCylinders.add(_backCylinderRight);

    return backCylinders;
}

function createFronts() {
    var fronts = new THREE.Object3D();
    var frontLeft = new THREE.Object3D();

    var frontHeight = 160;
    var frontWidth = 83;

    var frontX = frontHeight / 2 + 6;
    var frontZ = 100 - frontWidth - 2;

    var frontBorderHeight = 45;
    var frontBorderWidth = 5;
    var frontBorderDepth = 8;
    var frontBorderGeometry = new THREE.BoxGeometry(frontBorderWidth, frontBorderHeight, frontBorderDepth);

    frontBorderGeometry.vertices[6].setY(-frontBorderHeight / 2 + 6);
    frontBorderGeometry.vertices[7].setY(-frontBorderHeight / 2 + 6);

    frontBorderGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(frontBorderWidth / 2, (frontHeight - frontBorderHeight) / 2, 0));

    var frontBorder = new THREE.Mesh(frontBorderGeometry, primaryMat);

    frontLeft.add(frontBorder);

    var triangleWidth = frontWidth - frontBorderWidth;
    var triangleGeometry = TriangleGeometry(triangleWidth, frontHeight, PI / 2 - PI / 16, frontBorderDepth);

    triangleGeometry.applyMatrix(new THREE.Matrix4().makeRotationZ(PI / 16));

    var triangle = new THREE.Mesh(triangleGeometry, primaryMat);

    triangle.position.set(frontBorderWidth, -frontHeight / 2, -frontBorderDepth / 2);

    frontLeft.add(triangle);
    frontLeft.position.set(frontX, 0, -frontZ);
    frontLeft.rotation.set(PI / 2, 0, -PI / 2);

    fronts.add(frontLeft);

    var frontRight = frontLeft.clone();
    frontRight.position.set(frontX, 0, frontZ);
    frontRight.rotation.set(-PI / 2, 0, -PI / 2);
    fronts.add(frontRight);

    var frontCenter = new THREE.Object3D();

    var frontCenterWidth = 100;
    var frontCenterHeight = 6;
    var frontCenterDepth = 32;
    var frontCenterBorderX = frontCenterWidth / 2 - 4;
    var frontCenterBorderZ = frontCenterDepth / 2 - 2;

    var frontCenterGeometry = new THREE.BoxGeometry(frontCenterWidth, frontCenterHeight, frontCenterDepth);

    frontCenterGeometry.vertices[0].setX(frontCenterBorderX).setZ(frontCenterBorderZ);

    frontCenterGeometry.vertices[1].setX(frontCenterBorderX).setZ(-frontCenterBorderZ);

    frontCenterGeometry.vertices[4].setY(12).setZ(-frontCenterBorderZ);

    frontCenterGeometry.vertices[5].setY(12).setZ(frontCenterBorderZ);

    frontCenterGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, frontCenterHeight / 2 + 4, 0));

    var frontCenterTop = new THREE.Mesh(frontCenterGeometry, secondaryMat);

    frontCenter.add(frontCenterTop);

    var frontCenterBottom = frontCenterTop.clone();
    frontCenterBottom.rotation.x = PI;
    frontCenter.add(frontCenterBottom);

    frontCenter.position.x = frontCenterWidth / 2 + 22;

    fronts.add(frontCenter);

    return fronts;
}

function createCockpit() {
    var cockpit = new THREE.Object3D();

    var cockpitBodyTop = 14;
    var cockpitBodyBottom = 16;
    var cockpitBodyHeight = 50;
    var cockpitSegments = 32;
    var cockpitAngle = PI / 6;

    var cockpitHead = new THREE.Object3D();

    var cockpitHeadAngleHeight = 20;
    var cockpitHeadAngleSinus = Math.sin(PI / 4) * cockpitHeadAngleHeight;

    var cockpitHeadAngleGeometry = new THREE.CylinderGeometry(cockpitBodyBottom, cockpitBodyBottom, cockpitHeadAngleHeight, cockpitSegments);

    cockpitHeadAngleGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -cockpitHeadAngleHeight / 2, 0));

    for (var i = 0; i <= cockpitSegments; i++) {
        var _y = cockpitHeadAngleGeometry.vertices[i].y;

        cockpitHeadAngleGeometry.vertices[i].setY(_y - Math.sin(cockpitAngle) * cockpitHeadAngleGeometry.vertices[i].x);
    }

    var cockpitHeadAngle = new THREE.Mesh(cockpitHeadAngleGeometry, secondaryMat);

    cockpitHead.add(cockpitHeadAngle);

    var cockpitHeadCylinderHeight = 20;
    var cockpitHeadCylinderGeometry = new THREE.CylinderGeometry(cockpitBodyBottom, cockpitBodyBottom - 8, cockpitHeadCylinderHeight, cockpitSegments);

    cockpitHeadCylinderGeometry.vertices[cockpitSegments * 2 + 3].setY(-(cockpitHeadCylinderHeight / 2 + 1));

    var cockpitHeadCylinder = new THREE.Mesh(cockpitHeadCylinderGeometry, tertiaryMat);

    cockpitHeadCylinder.position.y = -cockpitHeadAngleHeight - cockpitHeadCylinderHeight / 2;
    cockpitHead.add(cockpitHeadCylinder);
    cockpit.add(cockpitHead);

    // draw body of cockpit
    var cockpitBodyGeometry = new THREE.CylinderGeometry(cockpitBodyTop, cockpitBodyBottom, cockpitBodyHeight, cockpitSegments);

    cockpitBodyGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, cockpitBodyHeight / 2, 0));

    for (var i = 0; i <= cockpitSegments; i++) {
        var _x = cockpitBodyGeometry.vertices[i].x;
        var _y2 = cockpitBodyGeometry.vertices[i].y;

        cockpitBodyGeometry.vertices[i].setX(_x + Math.sin(cockpitAngle) * 100);
        cockpitBodyGeometry.vertices[i].setY(_y2 - Math.sin(cockpitAngle) * _x);
    }

    var x = cockpitBodyGeometry.vertices[cockpitSegments * 2 + 2].x;
    var y = cockpitBodyGeometry.vertices[cockpitSegments * 2 + 2].y;

    cockpitBodyGeometry.vertices[cockpitSegments * 2 + 2].setX(x + Math.sin(cockpitAngle) * 100);
    cockpitBodyGeometry.vertices[cockpitSegments * 2 + 2].setY(y - Math.sin(cockpitAngle) * x);

    for (var i = cockpitSegments; i <= cockpitSegments * 2; i++) {
        var _y3 = cockpitHeadAngleGeometry.vertices[i - cockpitSegments].y;
        cockpitBodyGeometry.vertices[i + 1].setY(_y3);
    }

    var cockpitBody = new THREE.Mesh(cockpitBodyGeometry, secondaryMat);

    cockpit.add(cockpitBody);

    cockpit.applyMatrix(new THREE.Matrix4().makeRotationX(-PI / 2));
    cockpit.applyMatrix(new THREE.Matrix4().makeRotationY(PI / 2));

    cockpit.position.set(Math.sin(cockpitAngle) * 150, 5, Math.cos(cockpitAngle) * 90);

    return cockpit;
}

function createUndercarriages() {
    var undercarriages = new THREE.Object3D();

    var undercarriageDepth = 10;

    var backUndercarriage = new THREE.Object3D();
    var backUndercarriageLeft = new THREE.Object3D();

    var backUndercarriageBodyWidth = 25;
    var backUndercarriageBodyHeight = 60;

    var backUndercarriageBodyGeometry = new THREE.BoxGeometry(backUndercarriageBodyWidth, backUndercarriageBodyHeight, undercarriageDepth);

    backUndercarriageBodyGeometry.vertices[2].setY(-backUndercarriageBodyHeight / 2 - 2);
    backUndercarriageBodyGeometry.vertices[3].setY(-backUndercarriageBodyHeight / 2 - 2);
    backUndercarriageBodyGeometry.vertices[4].setY(backUndercarriageBodyHeight / 2 + 8);
    backUndercarriageBodyGeometry.vertices[5].setY(backUndercarriageBodyHeight / 2 + 8);

    var backUndercarriageBody = new THREE.Mesh(backUndercarriageBodyGeometry, tertiaryMat);

    backUndercarriageLeft.add(backUndercarriageBody);

    var backUndercarriageBorderWidth = 18;
    var backUndercarriageBorderHeight = 50;

    var backUndercarriageBorderGeometry = new THREE.BoxGeometry(backUndercarriageBorderWidth, backUndercarriageBorderHeight, undercarriageDepth);

    backUndercarriageBorderGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(-(backUndercarriageBodyWidth + backUndercarriageBorderWidth) / 2, (backUndercarriageBodyHeight - backUndercarriageBorderHeight) / 2, 0));

    backUndercarriageBorderGeometry.vertices[0].setY(backUndercarriageBodyHeight / 2 + 8);
    backUndercarriageBorderGeometry.vertices[1].setY(backUndercarriageBodyHeight / 2 + 8);
    backUndercarriageBorderGeometry.vertices[2].setY(-backUndercarriageBodyHeight / 2);
    backUndercarriageBorderGeometry.vertices[3].setY(-backUndercarriageBodyHeight / 2);

    var backUndercarriageBorder = new THREE.Mesh(backUndercarriageBorderGeometry, tertiaryMat);

    backUndercarriageLeft.add(backUndercarriageBorder);
    backUndercarriage.add(backUndercarriageLeft);

    var backUndercarriageRight = backUndercarriageLeft.clone();
    backUndercarriageRight.rotation.y = PI;
    backUndercarriageRight.position.x = backUndercarriageBodyWidth;
    backUndercarriage.add(backUndercarriageRight);

    backUndercarriage.applyMatrix(new THREE.Matrix4().makeTranslation(-backUndercarriageBodyWidth / 2, 0, 0));
    backUndercarriage.applyMatrix(new THREE.Matrix4().makeRotationY(PI / 2));
    backUndercarriage.applyMatrix(new THREE.Matrix4().makeRotationZ(-PI / 2));

    backUndercarriage.position.x = -25 - backUndercarriageBodyHeight / 2;
    backUndercarriage.position.y = -undercarriageDepth;

    undercarriages.add(backUndercarriage);

    var frontUndercarriageLeft = new THREE.Object3D();

    var frontUndercarriageHeight = 40;
    var frontUndercarriageWidth = 25;

    var frontUndercarriageBodyWidth = 15;

    var frontUndercarriageBodyGeometry = new THREE.BoxGeometry(frontUndercarriageBodyWidth, frontUndercarriageHeight, undercarriageDepth);

    frontUndercarriageBodyGeometry.vertices[4].setY(frontUndercarriageBodyGeometry.vertices[4].y - Math.sin(PI / 4) * frontUndercarriageBodyWidth);
    frontUndercarriageBodyGeometry.vertices[5].setY(frontUndercarriageBodyGeometry.vertices[5].y - Math.sin(PI / 4) * frontUndercarriageBodyWidth);

    var frontUndercarriageBody = new THREE.Mesh(frontUndercarriageBodyGeometry, tertiaryMat);

    frontUndercarriageLeft.add(frontUndercarriageBody);

    var frontUndercarriageBorderWidth = frontUndercarriageWidth - frontUndercarriageBodyWidth;

    var frontUndercarriageBorderGeometry = new THREE.BoxGeometry(frontUndercarriageBorderWidth, frontUndercarriageHeight, undercarriageDepth);

    frontUndercarriageBorderGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(frontUndercarriageWidth / 2, 0, 0));

    frontUndercarriageBorderGeometry.vertices[2].setY(frontUndercarriageBorderGeometry.vertices[2].y + Math.sin(PI / 4) * frontUndercarriageBorderWidth);
    frontUndercarriageBorderGeometry.vertices[3].setY(frontUndercarriageBorderGeometry.vertices[3].y + Math.sin(PI / 4) * frontUndercarriageBorderWidth);

    var frontUndercarriageBorder = new THREE.Mesh(frontUndercarriageBorderGeometry, tertiaryMat);

    frontUndercarriageLeft.add(frontUndercarriageBorder);

    frontUndercarriageLeft.applyMatrix(new THREE.Matrix4().makeRotationZ(-PI / 2));
    frontUndercarriageLeft.applyMatrix(new THREE.Matrix4().makeRotationX(PI / 2));

    frontUndercarriageLeft.position.set(50, -undercarriageDepth, 35.5);

    undercarriages.add(frontUndercarriageLeft);

    var frontUndercarriageRight = frontUndercarriageLeft.clone();
    frontUndercarriageRight.rotation.x = -PI / 2;
    frontUndercarriageRight.position.z = -35.5;
    undercarriages.add(frontUndercarriageRight);

    var frontUndercarriageCenterGeometry = new THREE.BoxGeometry(18, 60, undercarriageDepth);

    frontUndercarriageCenterGeometry.applyMatrix(new THREE.Matrix4().makeRotationZ(PI / 2));
    frontUndercarriageCenterGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(PI / 2));

    var frontUndercarriageCenter = new THREE.Mesh(frontUndercarriageCenterGeometry, secondaryMat);

    frontUndercarriageCenter.position.x = 65;
    frontUndercarriageCenter.position.y = -undercarriageDepth;

    undercarriages.add(frontUndercarriageCenter);

    return undercarriages;
}

function createParable() {
    var parable = new THREE.Object3D();

    var parableBaseTopRad = 5;
    var parableBaseBottomRad = 6;
    var parableBaseHeight = 3;

    var parableBaseGeometry = new THREE.CylinderGeometry(parableBaseTopRad, parableBaseBottomRad, parableBaseHeight, 32);

    var parableBase = new THREE.Mesh(parableBaseGeometry, tertiaryMat);

    parableBase.position.y = -parableBaseHeight / 2;

    parable.add(parableBase);

    var parableArmHeight = 12;
    var parableArmGeometry = new THREE.BoxGeometry(5, parableArmHeight, 3);

    var x = parableArmGeometry.vertices[2].x;
    var z = parableArmGeometry.vertices[2].z;

    parableArmGeometry.vertices[2].setX(x + 1);
    parableArmGeometry.vertices[3].setX(x + 1);
    parableArmGeometry.vertices[6].setX(-x - 1);
    parableArmGeometry.vertices[7].setX(-x - 1);

    parableArmGeometry.vertices[2].setZ(z + 1);
    parableArmGeometry.vertices[7].setZ(z + 1);
    parableArmGeometry.vertices[3].setZ(-z - 1);
    parableArmGeometry.vertices[6].setZ(-z - 1);

    var parableArm = new THREE.Mesh(parableArmGeometry, primaryMat);

    parableArm.position.y = parableArmHeight / 2;
    parable.add(parableArm);

    var parableArmTopHeight = 5;
    var parableArmTopGeometry = new THREE.CylinderGeometry(1.5, 1.5, parableArmTopHeight, 32);

    parableArmTopGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, parableArmTopHeight / 2, 0));

    var parableArmTop = new THREE.Mesh(parableArmTopGeometry, tertiaryMat);

    parableArmTop.rotation.x = PI / 2 - PI / 16;
    parableArmTop.position.y = parableArmHeight / 2 + 2;
    parableArmTop.position.z = 1;

    parable.add(parableArmTop);

    var parableRad = 12;
    var parableCylinderGeometry = new THREE.CylinderGeometry(parableRad, parableRad, .5, 32);

    parableCylinderGeometry.vertices[66].setY(2);
    parableCylinderGeometry.vertices[67].setY(1);

    parableCylinderGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-PI / 2 - PI / 16));

    var parableCylinder = new THREE.Mesh(parableCylinderGeometry, secondaryMat);

    parableCylinder.position.y = parableArmHeight / 2 + 4;
    parableCylinder.position.z = 7;

    parable.add(parableCylinder);

    parable.rotation.y = PI / 2 + PI / 16;
    parable.position.set(50, parableBaseHeight + 7.5, -50);

    return parable;
}

function TriangleGeometry(baseLength, leftLength, angle, depth) {
    var triangleShape = new THREE.Shape();

    var A = [baseLength, 0];
    var B = [0, 0];
    var C = [Math.cos(angle) * leftLength, Math.sin(angle) * leftLength];

    triangleShape.moveTo.apply(triangleShape, A);
    triangleShape.lineTo.apply(triangleShape, B);
    triangleShape.lineTo.apply(triangleShape, C);
    triangleShape.lineTo.apply(triangleShape, A);

    return new THREE.ExtrudeGeometry(triangleShape, {
        amount: depth,
        bevelEnabled: false
    });
}

function closeHalfCylinder(cylinderGeometry, segments) {
    cylinderGeometry.faces.push(new THREE.Face3(0, segments + 1, segments * 2 + 3));
    cylinderGeometry.faces.push(new THREE.Face3(0, segments * 2 + 2, segments * 2 + 3));
    cylinderGeometry.faces.push(new THREE.Face3(segments, segments * 2 + 1, segments * 2 + 3));
    cylinderGeometry.faces.push(new THREE.Face3(segments, segments * 2 + 2, segments * 2 + 3));

    cylinderGeometry.computeFaceNormals();
}

function haloMaterial(color) {
    return new THREE.ShaderMaterial({
        uniforms: {
            "c": { type: "f", value: 1 },
            "p": { type: "f", value: 6 },
            glowColor: { type: "c", value: new THREE.Color(color) },
            viewVector: { type: "v3", value: CAMERA.position }
        },
        vertexShader: "\n            uniform vec3 viewVector;\n            uniform float c;\n            uniform float p;\n            varying float intensity;\n            void main()\n            {\n                vec3 vNormal = normalize(normalMatrix * normal);\n                vec3 vNormel = normalize(normalMatrix * viewVector);\n                intensity = pow(c - dot(vNormal, vNormel), p);\n\n                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n            }\n        ",
        fragmentShader: "\n            uniform vec3 glowColor;\n            varying float intensity;\n            void main() \n            {\n                vec3 glow = glowColor * intensity;\n                gl_FragColor = vec4(glow, 1.0);\n            }\n        ",
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
}

createLights();

var millenniumFalcon = new THREE.Object3D();

millenniumFalcon.add(createBody());
millenniumFalcon.add(createRescueCapsules());
millenniumFalcon.add(createCenterCylinder());
millenniumFalcon.add(createBackCylinders());
millenniumFalcon.add(createFronts());
millenniumFalcon.add(createCockpit());
millenniumFalcon.add(createUndercarriages());
millenniumFalcon.add(createParable());

SCENE.add(millenniumFalcon);

// move the Falcon to mouse coords
window.onmousemove = handleMouseMove;
// looping
window.onclick = handleClick;
// shoot
window.onkeyup = handleKeyup;

loop();

function handleKeyup(e) {
    if (e.keyCode !== 32) {
        return false;
    }

    var speed = .5;

    var blasts = new THREE.Object3D();

    var blastTop = new THREE.Object3D();
    var blastTopPos = new THREE.Vector3().setFromMatrixPosition(shooterTop.matrixWorld);

    var blastWidth = 25;
    var blastCenter = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, blastWidth, 16), new THREE.MeshLambertMaterial({
        color: 0xffffff
    }));

    var blastHalo = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, blastWidth + 4, 16), haloMaterial(0xff0000));

    blastTop.add(blastCenter);
    blastTop.add(blastHalo);

    blastTop.rotation.z = -PI / 2;
    blastTop.position.x = blastTopPos.x + blastWidth / 2 + 20;
    blastTop.position.y = blastTopPos.y + 3;
    blastTop.position.z = blastTopPos.z;

    blasts.add(blastTop);

    var blastBottomPos = new THREE.Vector3().setFromMatrixPosition(shooterBottom.matrixWorld);
    var blastBottom = blastTop.clone();
    blastBottom.rotation.z = -PI / 2;
    blastBottom.position.x = blastBottomPos.x + blastWidth / 2 + 20;
    blastBottom.position.y = blastBottomPos.y - 3;
    blastBottom.position.z = blastBottomPos.z;
    blasts.add(blastBottom);

    SCENE.add(blasts);

    TweenLite.to(blasts.position, speed, {
        x: 1000,
        ease: Linear.ease,
        onComplete: function onComplete() {
            SCENE.remove(blasts);
        }
    });
}

var isLooping = false;

function handleMouseMove(e) {
    var x = e.pageX;
    var y = e.pageY;
    var halfWidth = WIDTH / 2;
    var halfHeight = HEIGHT / 2;
    var speed = 1;

    /*
     * x = cos(phi) * h
     * <=> x / h = cos(phi)
     * <=> phi = arccos(x / h)
     * y = h - sin(phi) * h
     * <=> y = h * (1 - sin(arccos(x / h)))
     */
    var posZ = (y - halfHeight) / 2.5;
    var posY = halfHeight * (1 - Math.sin(Math.acos(Math.abs(posZ) / halfHeight)));

    TweenLite.to(millenniumFalcon.position, speed, {
        z: posZ,
        y: posY
    });

    var mAngle = PI / 8;
    var mXrotation = -posZ / halfHeight * 2 * PI / 3;

    if (!isLooping) {
        TweenLite.to(millenniumFalcon.rotation, speed, {
            x: mXrotation
        });
    }

    for (var _iterator = boosters, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref = _iterator[_i++];
        } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref = _i.value;
        }

        var h = _ref;

        TweenLite.to(h.scale, speed, {
            x: x / WIDTH * 1.5
        });
    }

    TweenLite.to(millenniumFalcon.position, speed, {
        x: (x - halfWidth) / halfWidth * 100
    });
}

function handleClick(e) {
    if (!isLooping) {
        (function () {
            isLooping = true;

            var originalXrotation = millenniumFalcon.rotation.x;
            var speed = 2;

            var mXrotation = originalXrotation;

            if (e.pageY <= HEIGHT / 2) {
                mXrotation += 2 * PI;
            } else {
                mXrotation -= 2 * PI;
            }

            TweenLite.to(millenniumFalcon.rotation, speed, {
                x: mXrotation,
                ease: Back.easeOut,
                onComplete: function onComplete() {
                    millenniumFalcon.rotation.x = originalXrotation;
                    isLooping = false;
                }
            });
        })();
    }
}
