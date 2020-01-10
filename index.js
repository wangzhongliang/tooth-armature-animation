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
camera.position.set(5,5,5);

var ambient = new THREE.AmbientLight( 0x222222,2 );
scene.add( ambient );

var directionalLight = new THREE.DirectionalLight( 0xdddddd, 4 );
directionalLight.position.set( 1, 0, 1 ).normalize();
scene.add( directionalLight );

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

var orbitControls = new THREE.OrbitControls( camera, renderer.domElement );
// orbitControls.target.copy( new THREE.Vector3(0,0,0));
var loader = new THREE.GLTFLoader();

// var dracoLoader = new THREE.DRACOLoader();
// dracoLoader.setDecoderPath('lib/gltf/');
// loader.setDRACOLoader(dracoLoader);
var loadStartTime = performance.now();
var mixer,gltf,playAnimation=false;
loader.load('data/tooth3.glb', function (data) {

    gltf = data;

    var object = gltf.scene;

    console.info('Load time: ' + (performance.now() - loadStartTime).toFixed(2) + ' ms.');

    object.traverse(function (node) {

        if (node.isMesh || node.isLight) node.castShadow = true;

    });

    var animations = gltf.animations;

    if (animations && animations.length) {

        mixer = new THREE.AnimationMixer(object);

        for (var i = 0; i < animations.length; i++) {

            var animation = animations[i];

            // // There's .3333 seconds junk at the tail of the Monster animation that
            // // keeps it from looping cleanly. Clip it at 3 seconds
            // if (sceneInfo.animationTime) {

            //     animation.duration = sceneInfo.animationTime;

            // }

            var action = mixer.clipAction(animation);

            // action.play();

        }

    }

    // object.scale.set(0.005,0.005,0.005)
    scene.add(object);
    onWindowResize();

}, undefined, function (error) {

    console.error(error);

});

function animate() {
    requestAnimationFrame(animate);
    if (mixer) mixer.update(clock.getDelta());
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

function toggleAnimations() {
    playAnimation=!playAnimation;
    for ( var i = 0; i < gltf.animations.length; i ++ ) {
        var clip = gltf.animations[ i ];
        var action = mixer.existingAction( clip );
        playAnimation ? action.play() : action.stop();
    }
}
animate();