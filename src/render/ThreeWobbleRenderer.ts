import * as THREE from "three";
import type { DeformMesh, LoadedImage } from "../types";

export class ThreeWobbleRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private geometry: THREE.BufferGeometry | null = null;
  private material: THREE.MeshBasicMaterial | null = null;
  private meshObject: THREE.Mesh | null = null;
  private texture: THREE.Texture | null = null;
  private width = 1;
  private height = 1;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(0, 1, 0, 1, -1000, 1000);
    this.camera.position.z = 1;
  }

  mount(container: HTMLElement) {
    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.className = "render-canvas";
  }

  setImage(image: LoadedImage) {
    this.width = image.width;
    this.height = image.height;
    this.texture?.dispose();
    this.texture = new THREE.CanvasTexture(imageToCanvas(image));
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.needsUpdate = true;

    this.material?.dispose();
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.resize(image.width, image.height);
  }

  setMesh(mesh: DeformMesh) {
    this.geometry?.dispose();
    this.geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(mesh.vertices.length * 3);
    const uvs = new Float32Array(mesh.vertices.length * 2);

    mesh.vertices.forEach((vertex, index) => {
      positions[index * 3] = vertex.baseX;
      positions[index * 3 + 1] = this.height - vertex.baseY;
      positions[index * 3 + 2] = 0;
      uvs[index * 2] = vertex.u;
      uvs[index * 2 + 1] = 1 - vertex.v;
    });

    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    this.geometry.setIndex(mesh.indices);
    this.geometry.computeVertexNormals();

    if (this.meshObject) {
      this.scene.remove(this.meshObject);
    }

    this.meshObject = new THREE.Mesh(this.geometry, this.material ?? undefined);
    this.scene.add(this.meshObject);
    this.updateVertices(mesh);
  }

  updateVertices(mesh: DeformMesh) {
    if (!this.geometry) return;
    const position = this.geometry.getAttribute("position") as THREE.BufferAttribute;
    mesh.vertices.forEach((vertex, index) => {
      position.setXYZ(index, vertex.x, this.height - vertex.y, 0);
    });
    position.needsUpdate = true;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  getCanvas() {
    return this.renderer.domElement;
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.camera.left = 0;
    this.camera.right = width;
    this.camera.top = height;
    this.camera.bottom = 0;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  destroy() {
    this.geometry?.dispose();
    this.material?.dispose();
    this.texture?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

function imageToCanvas(image: LoadedImage) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable, so the texture could not be created.");
  ctx.drawImage(image.bitmap, 0, 0, image.width, image.height);
  return canvas;
}
