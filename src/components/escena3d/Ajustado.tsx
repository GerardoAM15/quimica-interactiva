import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Escala y centra su contenido para que quepa en un cubo de lado `lado` situado en `posicion`.
 * Permite colocar juntos objetos modelados a escalas distintas (productos, miniaturas de la vitrina).
 */
export function Ajustado({ children, lado = 1, posicion = [0, 0, 0], clave }: { children: ReactNode; lado?: number; posicion?: [number, number, number]; clave?: string }) {
  const exterior = useRef<THREE.Group>(null);
  const interior = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  useLayoutEffect(() => {
    const ext = exterior.current, int = interior.current;
    if (!ext || !int) return;
    // Se mide el contenido sin transformar (en el espacio del grupo exterior)
    ext.scale.setScalar(1);
    int.position.set(0, 0, 0);
    ext.updateWorldMatrix(true, true);
    const caja = new THREE.Box3().setFromObject(int);
    if (caja.isEmpty()) return;
    const inversa = ext.matrixWorld.clone().invert();
    caja.applyMatrix4(inversa);
    const tam = caja.getSize(new THREE.Vector3());
    const centro = caja.getCenter(new THREE.Vector3());
    int.position.copy(centro).multiplyScalar(-1);
    ext.scale.setScalar(lado / Math.max(tam.x, tam.y, tam.z, 1e-6));
    invalidate();
  }, [lado, clave, invalidate]);
  return (
    <group ref={exterior} position={posicion}>
      <group ref={interior}>{children}</group>
    </group>
  );
}
