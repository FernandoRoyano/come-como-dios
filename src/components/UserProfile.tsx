import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function UserProfile() {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    fechaNacimiento: '',
    estatura: '',
    peso: ''
  });

  useEffect(() => {
    if (!session?.user?.email) return;
    fetch(`/api/user/get?email=${session.user.email}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setForm({
          fechaNacimiento: data.fechaNacimiento || '',
          estatura: data.estatura || '',
          peso: data.peso || ''
        });
      })
      .finally(() => setLoading(false));
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    await fetch('/api/user/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: session?.user?.email,
        name: session?.user?.name,
        ...form
      })
    });
    setEdit(false);
    setUser({ ...user, ...form });
  };

  if (loading) return <div style={{padding:'1rem'}}>Cargando perfil...</div>;
  if (!user) return <div style={{padding:'1rem'}}>No se encontró el usuario.</div>;

  return (
    <div style={{background:'#fff',borderRadius:12,padding:24,maxWidth:400,margin:'2rem auto',boxShadow:'0 2px 8px #0001'}}>
      <h2 style={{textAlign:'center'}}>Perfil de Usuario</h2>
      <div style={{marginBottom:16}}><strong>Nombre:</strong> {session?.user?.name}</div>
      <div style={{marginBottom:16}}><strong>Email:</strong> {session?.user?.email}</div>
      <div style={{marginBottom:16}}>
        <strong>Fecha de nacimiento:</strong>{' '}
        {edit ? (
          <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} />
        ) : (
          user.fechaNacimiento ? new Date(user.fechaNacimiento).toLocaleDateString() : 'No especificada'
        )}
      </div>
      <div style={{marginBottom:16}}>
        <strong>Estatura:</strong>{' '}
        {edit ? (
          <input type="number" name="estatura" value={form.estatura} onChange={handleChange} style={{width:80}} />
        ) : (
          user.estatura ? `${user.estatura} cm` : 'No especificada'
        )}
      </div>
      <div style={{marginBottom:16}}>
        <strong>Peso actual:</strong>{' '}
        {edit ? (
          <input type="number" name="peso" value={form.peso} onChange={handleChange} style={{width:80}} />
        ) : (
          user.peso ? `${user.peso} kg` : 'No especificado'
        )}
      </div>
      {edit ? (
        <button onClick={handleSave} style={{marginRight:8}}>Guardar</button>
      ) : (
        <button onClick={() => setEdit(true)}>Editar</button>
      )}
    </div>
  );
}
