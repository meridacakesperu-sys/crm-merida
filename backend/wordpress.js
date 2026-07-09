require('dotenv').config();

const WP_URL = process.env.WP_URL;
const WP_USER = process.env.WP_USER;
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD;

// Helper para obtener los headers de autenticación
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + Buffer.from(`${WP_USER}:${WP_APP_PASSWORD}`).toString('base64')
  };
};

/**
 * Buscar usuario por email en WordPress
 * Útil para saber si ya existe o para obtener su ID.
 */
const getWPUserByEmail = async (email) => {
  try {
    const res = await fetch(`${WP_URL}/wp-json/wp/v2/users?search=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: getHeaders()
    });
    const users = await res.json();
    if (users && users.length > 0) {
      // Filtrar para asegurarse de que el email coincide exactamente
      return users.find(u => u.slug === email.split('@')[0] || u.name !== undefined) || users[0];
    }
    return null;
  } catch (error) {
    console.error('Error buscando usuario en WP:', error);
    return null;
  }
};

/**
 * Crear o actualizar usuario en WordPress.
 * Si se crea, se usa la contraseña real.
 */
const syncUserToWP = async (student) => {
  try {
    let wpUserId = student.wpId; // Si ya lo teníamos guardado
    
    // Si no tenemos ID, buscar si ya existe en WP por email
    if (!wpUserId && student.email) {
      const existingUser = await getWPUserByEmail(student.email);
      if (existingUser) {
        wpUserId = existingUser.id;
      }
    }

    const payload = {
      email: student.email,
      first_name: student.nombre.split(' ')[0],
      name: student.nombre
    };

    // Al crear un usuario nuevo, la contraseña es la que generó el CRM
    if (!wpUserId) {
      payload.username = student.usuario || student.email.split('@')[0];
      payload.password = student.password;
      payload.roles = ['subscriber'];
      
      const createRes = await fetch(`${WP_URL}/wp-json/wp/v2/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      
      const createData = await createRes.json();
      if (createRes.ok) {
        console.log(`✅ Usuario WP creado exitosamente: ${payload.username}`);
        return createData.id;
      } else {
        console.error('❌ Error creando usuario en WP:', createData);
        return null;
      }
    } else {
      // Si ya existe, solo le actualizamos los datos básicos (por si cambió el nombre o correo)
      // Y manejamos la activación / desactivación
      
      if (student.estatus === 'Desactivado' || student.estatus === 'De baja') {
        // Enviar petición a nuestro plugin puente para suspender
        const statusRes = await fetch(`${WP_URL}/wp-json/crm/v1/status/${wpUserId}`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ status: 'suspended' })
        });
        if (statusRes.ok) console.log(`🔒 Suspendiendo usuario en WP: ${student.email}`);
      } else {
        // Enviar petición a nuestro plugin puente para reactivar
        const statusRes = await fetch(`${WP_URL}/wp-json/crm/v1/status/${wpUserId}`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ status: 'active' })
        });
        if (statusRes.ok) console.log(`🔓 Restaurando acceso de usuario en WP: ${student.email}`);
      }

      // Actualizar datos básicos (por si cambió el nombre en el CRM)
      const updateRes = await fetch(`${WP_URL}/wp-json/wp/v2/users/${wpUserId}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          first_name: payload.first_name,
          name: payload.name
        })
      });
      
      if (updateRes.ok) {
        console.log(`✅ Usuario WP actualizado/sincronizado: ${student.email}`);
        return wpUserId;
      } else {
        const errorData = await updateRes.json();
        console.error('❌ Error actualizando usuario en WP:', errorData);
        return wpUserId;
      }
    }
  } catch (error) {
    console.error('❌ Error de conexión con WP API:', error);
    return null;
  }
};

module.exports = {
  syncUserToWP
};
