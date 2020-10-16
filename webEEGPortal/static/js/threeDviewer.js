var container, stats;
var camera, scene, renderer;
var directionalLight;
var mouseX = 0, mouseY = 0;


// Mouse at the center of the screen.
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var sizeX = 500, sizeY = 500;
var brain;

init();
animate();


function init() {
    // We put the container inside a div with id #threejsbrain
    var puthere = document.getElementById("threejsbrain");
    container = document.createElement( 'div' );
    puthere.appendChild( container );

    // full screen.
    // camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    camera = new THREE.PerspectiveCamera( 45,sizeX/sizeY , 1, 2000 );
    camera.position.z = -10;

    // scene

    scene = new THREE.Scene();

    var ambient = new THREE.AmbientLight( 0x111111 );
    scene.add( ambient );

    directionalLight = new THREE.DirectionalLight( 0xffeedd );
    directionalLight.position.set( 0, 0, -1 );
    scene.add( directionalLight );

    // texture

    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {

	console.log( item, loaded, total );

    };

    // model
    // Load brain

    var loader = new THREE.OBJLoader( manager );
    loader.load( 'lh.obj', function ( object ) {
	brain = object;
	object.traverse( function( child ) {
	    if ( child instanceof THREE.Mesh ) {
		child.castShadow = false;
		child.material.color.set(0xFFFFFF);
                child.material.opacity = 0.2;
                child.material.transparent = true;
	    }
	} );
	object.position.y = 0;
	scene.add( object );
    } );

    var loader = new THREE.OBJLoader( manager );
    loader.load( 'rh.obj', function ( object ) {
	brain = object;
	object.traverse( function( child ) {
	    if ( child instanceof THREE.Mesh ) {
		child.castShadow = false;
		child.material.color.set(0xFFFFFF);
                child.material.opacity = 0.2;
                child.material.transparent = true;
	    }
	} );
	object.position.y = 0;
	scene.add( object );
    } );
    var loader = new THREE.OBJLoader( manager );
    loader.load( 'aseg_1006.obj', function ( object ) {
	brain = object;
	object.traverse( function( child ) {
	    if ( child instanceof THREE.Mesh ) {
		child.castShadow = true;
		child.material.color.set(0x0000FF);
	    }
	} );
	object.position.y = 0;
	scene.add( object );
    } );


    var loader = new THREE.OBJLoader( manager );
    loader.load( 'aseg_17.obj', function ( object ) {
	brain2 = object;
	object.traverse( function( child ) {
	    if ( child instanceof THREE.Mesh ) {
		child.castShadow = true;
		child.material.color.set(0xFF0000);
	    }
	} );
	//object.position.y = 16;
	//object.position.x = 20;
	//object.position.z = -15;
	scene.add( object );
    } );

    var loader = new THREE.OBJLoader( manager );
    loader.load( 'aseg_53.obj', function ( object ) {
	brain2 = object;
	object.traverse( function( child ) {
	    if ( child instanceof THREE.Mesh ) {
		child.castShadow = true;
		child.material.color.set(0xFF0000);
	    }
	} );
	//object.position.y = 16;
	//object.position.x = 20;
	//object.position.z = -15;
	scene.add( object );
    } );
    //

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( 700, 700);
    // renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    // window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {
    mouseX = ( event.clientX - windowHalfX ) / 4;
    mouseY = ( event.clientY - windowHalfY ) / 4;
}

//

function animate() {
    requestAnimationFrame( animate );
    render();
}

function render() {
    // camera.position.x += ( mouseX - camera.position.x ) * .05;
    // camera.position.y += ( - mouseY - camera.position.y ) * .05;

    var r = 300;
    var s = 0.05;

    // We have the camera orbit in a sphere around the brain, having
    // the light follow so it's well-lit.
    camera.position.x = r * Math.sin( mouseX * s ) * Math.cos(mouseY/2 * s);
    camera.position.z = -r * Math.cos( mouseX * s ) * Math.cos(mouseY/2 * s);
    camera.position.y = r * Math.sin(mouseY/2 * s);

    directionalLight.position.x = r * Math.sin( mouseX * s ) * Math.cos(mouseY/2 * s);
    directionalLight.position.z = -r * Math.cos( mouseX * s ) * Math.cos(mouseY/2 * s);
    directionalLight.position.y = r * Math.sin(mouseY/2 * s);

    //brain.rotation.z += 0.05;
    //brain2.rotation.z += 0.05;
    camera.lookAt( scene.position );

    renderer.render( scene, camera );
}
