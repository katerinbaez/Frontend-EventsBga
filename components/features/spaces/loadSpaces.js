const loadSpaces = async () => {
  try {
    setLoading(true);
    // Primero, obtener todos los espacios culturales registrados desde el perfil del gestor
    const response = await axios.get(`${BACKEND_URL}/api/managers/managers`);
    console.log('Espacios cargados desde managers:', response.data);
    
    if (response.data.success) {
      // Crear un array para almacenar los espacios con datos completos
      let spacesWithFullData = [];
      
      // Para cada espacio, obtener sus datos completos
      for (const space of response.data.managers) {
        // Asegurar que el espacio tenga coordenadas válidas
        let spaceWithCoords = {...space};
        
        // Si el espacio no tiene coordenadas válidas, asignarle unas aleatorias
        if (!space.latitud || !space.longitud || 
            isNaN(parseFloat(space.latitud)) || 
            isNaN(parseFloat(space.longitud))) {
          
          // Generar coordenadas aleatorias alrededor de Bucaramanga
          const baseLatitude = 7.119349; // Coordenada base (Bucaramanga)
          const baseLongitude = -73.1227416;
          
          // Generar un desplazamiento aleatorio (entre -0.02 y 0.02 grados)
          const latOffset = (Math.random() * 0.04 - 0.02);
          const lngOffset = (Math.random() * 0.04 - 0.02);
          
          spaceWithCoords.latitud = (baseLatitude + latOffset).toString();
          spaceWithCoords.longitud = (baseLongitude + lngOffset).toString();
          
          console.log(`Generando coordenadas para ${space.nombreEspacio || 'Espacio sin nombre'}:`, {
            latitud: spaceWithCoords.latitud,
            longitud: spaceWithCoords.longitud
          });
        }
        
        try {
          // Obtener los datos básicos del perfil del gestor
          const managerId = space.userId || space.id;
          if (managerId) {
            try {
              // Obtener detalles adicionales del perfil del gestor
              const detailsResponse = await axios.get(`${BACKEND_URL}/api/managers/manager/${managerId}`);
              console.log(`Detalles del gestor ${managerId}:`, detailsResponse.data);
              
              let fullSpaceData = {
                ...space,
                horarios: detailsResponse.data.manager?.horarios || space.horarios,
                descripcion: detailsResponse.data.manager?.descripcion || space.descripcion
              };
              
              // 2. Intentar obtener datos adicionales del modelo CulturalSpace usando las rutas correctas
              try {
                // Usar la ruta correcta para obtener datos del espacio cultural por ID de manager
                const culturalSpaceResponse = await axios.get(`${BACKEND_URL}/api/cultural-spaces/space/manager/${managerId}`);
                console.log(`Datos del espacio cultural para el gestor ${managerId}:`, culturalSpaceResponse.data);
                
                if (culturalSpaceResponse.data.success && culturalSpaceResponse.data.space) {
                  const spaceData = culturalSpaceResponse.data.space;
                  
                  // Combinar datos, priorizando los que vienen del modelo CulturalSpace
                  fullSpaceData = {
                    ...fullSpaceData,
                    // Datos que queremos obtener del modelo CulturalSpace si existen
                    images: spaceData.images || fullSpaceData.images || [],
                    imagenes: spaceData.images || fullSpaceData.imagenes || [],
                    instalaciones: spaceData.instalaciones || fullSpaceData.instalaciones || [],
                    redesSociales: spaceData.redesSociales || fullSpaceData.redesSociales || {
                      facebook: '',
                      instagram: '',
                      twitter: ''
                    },
                    // Preservar los datos básicos del perfil del gestor
                    nombreEspacio: fullSpaceData.nombreEspacio || spaceData.nombre || 'Espacio Cultural',
                    direccion: fullSpaceData.direccion || spaceData.direccion || '',
                    capacidad: fullSpaceData.capacidad || spaceData.capacidad || '',
                    contacto: fullSpaceData.contacto || spaceData.contacto || {
                      email: fullSpaceData.email || '',
                      telefono: fullSpaceData.telefono || ''
                    },
                    // Mantener los horarios y descripción ya procesados
                    horarios: fullSpaceData.horarios,
                    descripcion: fullSpaceData.descripcion || spaceData.descripcion || '',
                    // Capturar coordenadas para geolocalización
                    latitud: spaceData.latitud || fullSpaceData.latitud || null,
                    longitud: spaceData.longitud || fullSpaceData.longitud || null
                  };
                }
              } catch (culturalSpaceError) {
                console.log('No se pudieron obtener datos del espacio cultural:', culturalSpaceError);
              }
              
              // Procesar horarios para asegurar un formato consistente
              let horariosFormateados = {};
              
              if (Array.isArray(fullSpaceData.horarios)) {
                // Si es un array, convertirlo a objeto
                fullSpaceData.horarios.forEach(dia => {
                  const nombreDia = dia.day.toLowerCase();
                  let horasString = '';
                  
                  if (dia.isOpen && dia.openTime && dia.closeTime) {
                    horasString = `${dia.openTime} - ${dia.closeTime}`;
                  }
                  
                  horariosFormateados[nombreDia] = dia.isOpen ? horasString : 'Cerrado';
                });
              } else if (typeof fullSpaceData.horarios === 'object' && !Array.isArray(fullSpaceData.horarios)) {
                // Si ya es un objeto, asegurarse de que tenga todos los días
                const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
                dias.forEach(dia => {
                  horariosFormateados[dia] = fullSpaceData.horarios[dia] || '';
                });
              }
              
              // Agregar el espacio con datos completos al array
              spacesWithFullData.push({
                ...fullSpaceData,
                horarios: horariosFormateados,
                // Asegurar que se usen las coordenadas generadas si existen
                latitud: fullSpaceData.latitud || spaceWithCoords.latitud,
                longitud: fullSpaceData.longitud || spaceWithCoords.longitud
              });
            } catch (detailsError) {
              console.log(`Error al obtener detalles para el espacio ${managerId}:`, detailsError);
              // Si hay error, usar los datos básicos con coordenadas
              spacesWithFullData.push({
                ...spaceWithCoords,
                latitud: spaceWithCoords.latitud,
                longitud: spaceWithCoords.longitud
              });
            }
          } else {
            // Si no hay ID de manager, usar los datos básicos con coordenadas
            spacesWithFullData.push({
              ...spaceWithCoords,
              latitud: spaceWithCoords.latitud,
              longitud: spaceWithCoords.longitud
            });
          }
        } catch (error) {
          console.log(`Error al obtener detalles para el espacio ${space.id || space.userId}:`, error);
          // Si hay error, usar los datos básicos con coordenadas
          spacesWithFullData.push({
            ...spaceWithCoords,
            latitud: spaceWithCoords.latitud,
            longitud: spaceWithCoords.longitud
          });
        }
      }
      
      console.log('Espacios con datos completos:', spacesWithFullData);
      setSpaces(spacesWithFullData || []);
      setFilteredSpaces(spacesWithFullData || []);
    } else {
      console.log('Error al cargar espacios:', response.data);
      setSpaces([]);
      setFilteredSpaces([]);
    }
  } catch (error) {
    console.error('Error al cargar espacios:', error);
    setSpaces([]);
    setFilteredSpaces([]);
  } finally {
    setLoading(false);
  }
};
