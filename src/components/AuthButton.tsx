'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import styles from './AuthButton.module.css'; // 🧩 Importa los estilos del botón
import { FcGoogle } from 'react-icons/fc'; // 🎨 Icono de Google

export default function AuthButton() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') return <p>Cargando...</p>;

  return session ? (
    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
      <p style={{ marginBottom: '0.5rem' }}>Hola, {session.user?.name}</p>
      <div className={styles.authButtons}>
        <button 
          className={styles['auth-button']} 
          onClick={() => router.push('/dashboard')}
        >
          Mi Panel
        </button>
        <button 
          className={styles['auth-button']} 
          onClick={() => signOut()}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  ) : (
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      {/* 🧩 Botón de login con icono de Google */}
      <button className={styles['auth-button']} onClick={() => signIn('google')}>
        <FcGoogle style={{ marginRight: '8px', fontSize: '1.2rem' }} />
        Iniciar sesión con Google
      </button>
    </div>
  );
}
