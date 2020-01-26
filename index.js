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

var ambient = new THREE.AmbientLight( 0xffffff,1 );
scene.add( ambient );

var directionalLight = new THREE.DirectionalLight( 0xdddddd, 3 );
directionalLight.position.set( -1, 0, 0 ).normalize();
scene.add( directionalLight );

var pointLight = new THREE.PointLight( 0xdddddd, 3 );
pointLight.position.set( 1, 0, 0 ).normalize();
scene.add( pointLight );

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

var orbitControls = new THREE.OrbitControls( camera, renderer.domElement );
orbitControls.minDistance = 5;
orbitControls.maxDistance = 20;
// orbitControls.target.copy( new THREE.Vector3(0,0,0));
var manager = new THREE.LoadingManager();
manager.onStart = function ( url, itemsLoaded, itemsTotal ) {
	upperhint.innerHTML = '正在下载模型, 已下载: ('+ itemsLoaded + '/' + itemsTotal + ') 个.' ;
};
manager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
    upperhint.innerHTML = '正在下载模型, 已下载: ('+ itemsLoaded + '/' + itemsTotal + ') 个.' ;
};
manager.onLoad = function ( ) {
	upperhint.innerHTML='';
};
var loader = new THREE.GLTFLoader(manager);

// var dracoLoader = new THREE.DRACOLoader();
// dracoLoader.setDecoderPath('lib/gltf/');
// loader.setDRACOLoader(dracoLoader);
var loadStartTime = performance.now();
var mixerupper,mixerlower,upper,lower,upperObject,lowerObject,playAnimation=false;
var upperhint = document.getElementById('upperhint');
loader.load('data/upperNoUV.glb', function (data) {
    upper = data;
    var object = upperObject = upper.scene;
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
            action.loop=THREE.LoopOnce
            action.clampWhenFinished = true;
            // action.play();
        }
        mixerupper.addEventListener( 'finished', function( e ) {
            // console.log(e)
            // e.action.stop();
            // console.log('finish')
            toggle.disabled=false;
        } );
    }
    object.scale.set(0.1,0.1,0.1)
    scene.add(object);
    onWindowResize();
}, function ( xhr ) {
    // if(xhr.loaded / xhr.total>=1){
    //     upperhint.innerHTML='';
    //     return;
    // }
    // upperhint.innerHTML = '上牙模型已下载 '+(xhr.loaded / xhr.total * 100) + '%' ;

}, function (error) {
    console.error(error);
});
var lowerhint = document.getElementById('lowerhint');
loader.load('data/lowerNoUV.glb', function (data) {
    lower = data;
    var object = lowerObject = lower.scene;
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
            action.loop=THREE.LoopOnce
            action.clampWhenFinished = true;
            // action.play();
        }
        mixerlower.addEventListener( 'finished', function( e ) {
            // console.log(e)
            // e.action.stop();
            // console.log('finish');
            toggle.disabled=false;
        } );
    }
    object.scale.set(0.1,0.1,0.1)
    scene.add(object);
    onWindowResize();
}, function ( xhr ) {
    // if(xhr.loaded / xhr.total>=1){
    //     lowerhint.innerHTML='';
    //     return;
    // }
    // lowerhint.innerHTML='下牙模型已下载 '+(xhr.loaded / xhr.total * 100) + '%' ;
}, function (error) {
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
    // playAnimation=!playAnimation;
    for ( var i = 0; i < upper.animations.length; i ++ ) {
        var clip = upper.animations[ i ];
        var action = mixerupper.existingAction( clip );
        action.stop();
        action.play();
    }
    for ( var i = 0; i < lower.animations.length; i ++ ) {
        var clip = lower.animations[ i ];
        var action = mixerlower.existingAction( clip );
        action.stop();
        action.play();
    }
    toggle.disabled=true;
    // toggle.value = playAnimation?"停止":"演示";
}

var isOpen = false;
var open = document.getElementById('open');
open.value = isOpen?"合上":"打开";
open.onclick = ()=>{
    isOpen = !isOpen;
    if(isOpen){
        upperObject.position.set(0,1,0)
        lowerObject.position.set(0,-1,0)
    }
    else{
        upperObject.position.set(0,0,0)
        lowerObject.position.set(0,0,0)
    }
    open.value = isOpen?"合上":"打开";
}
animate();