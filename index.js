window.addEventListener( 'resize', onWindowResize, false );
var container = document.getElementById( 'container' );

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.physicallyCorrectLights = true;
container.appendChild( renderer.domElement );
var scene = new THREE.Scene();
scene.background = new THREE.Color( 0x222222 );
var clock = new THREE.Clock();

var camera = new THREE.PerspectiveCamera( 45, container.offsetWidth / container.offsetHeight, 0.001, 1000 );
scene.add( camera );
camera.position.set(-10,0,0);

// var axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

var ambient = new THREE.AmbientLight( 0x222222,2 );
scene.add( ambient );

var directionalLight = new THREE.DirectionalLight( 0xdddddd, 4 );
directionalLight.position.set( -1, 0, 0 ).normalize();
scene.add( directionalLight );

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

var orbitControls = new THREE.OrbitControls( camera, renderer.domElement );
orbitControls.minDistance = 5;
orbitControls.maxDistance = 20;
// orbitControls.target.copy( new THREE.Vector3(0,0,0));
var loader = new THREE.GLTFLoader();

// var dracoLoader = new THREE.DRACOLoader();
// dracoLoader.setDecoderPath('lib/gltf/');
// loader.setDRACOLoader(dracoLoader);
var loadStartTime = performance.now();
var mixerupper,mixerlower,upper,lower,playAnimation=false;
loader.load('data/upperUVTexture.glb', function (data) {
    upper = data;
    var object = upper.scene;
    console.info('Load time: ' + (performance.now() - loadStartTime).toFixed(2) + ' ms.');
    object.traverse(function (node) {
        if (node.isMesh || node.isLight) node.castShadow = true;
    });
    var animations = upper.animations;
    if (animations && animations.length) {
        mixerupper = new THREE.AnimationMixer(object);
        for (var i = 0; i < animations.length; i++) {
            var animation = animations[i];
            var action = mixerupper.clipAction(animation);
            // action.loop=THREE.LoopOnce
            // action.play();
        }
    }
    object.scale.set(0.1,0.1,0.1)
    scene.add(object);
    onWindowResize();
}, undefined, function (error) {
    console.error(error);
});
loader.load('data/lowerUVTexture.glb', function (data) {
    lower = data;
    var object = lower.scene;
    console.info('Load time: ' + (performance.now() - loadStartTime).toFixed(2) + ' ms.');
    object.traverse(function (node) {
        if (node.isMesh || node.isLight) node.castShadow = true;
    });
    var animations = lower.animations;
    if (animations && animations.length) {
        mixerlower = new THREE.AnimationMixer(object);
        for (var i = 0; i < animations.length; i++) {
            var animation = animations[i];
            var action = mixerlower.clipAction(animation);
            // action.loop=THREE.LoopOnce
            // action.play();
        }
    }
    object.scale.set(0.1,0.1,0.1)
    scene.add(object);
    onWindowResize();
}, undefined, function (error) {
    console.error(error);
});

var delta;
function animate() {
    requestAnimationFrame(animate);
    delta = clock.getDelta();
    if (mixerupper) mixerupper.update(delta);
    if (mixerlower) mixerlower.update(delta);
    orbitControls.update();
    render();
}

function render() {
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

var toggle = document.getElementById('toggle');
toggle.value = playAnimation?"停止":"演示";
toggle.onclick = ()=>{
    playAnimation=!playAnimation;
    for ( var i = 0; i < upper.animations.length; i ++ ) {
        var clip = upper.animations[ i ];
        var action = mixerupper.existingAction( clip );
        playAnimation ? action.play() : action.stop();
    }
    for ( var i = 0; i < lower.animations.length; i ++ ) {
        var clip = lower.animations[ i ];
        var action = mixerlower.existingAction( clip );
        playAnimation ? action.play() : action.stop();
    }
    toggle.value = playAnimation?"停止":"演示";
}
animate();