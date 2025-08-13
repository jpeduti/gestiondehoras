import { supabase } from './supabase'

export const seedService = {
  // Crear roles (si no existen)
  async createRoles() {
    const roles = [
      {
        name: 'admin',
        description: 'Administrador del Sistema',
        permissions: { manage_users: true, manage_projects: true, view_all_reports: true }
      },
      {
        name: 'jp',
        description: 'Jefe de Proyecto',
        permissions: { register_hours: true, view_own_projects: true, view_own_reports: true }
      },
      {
        name: 'director',
        description: 'Director de Área',
        permissions: { view_reports: true, manage_projects: true }
      }
    ]

    for (const role of roles) {
      const { error } = await supabase
        .from('roles')
        .upsert(role, { onConflict: 'name' })

      if (error) {
        console.error(`Error creating role ${role.name}:`, error)
      }
    }
  },

  // Crear usuarios de prueba (solo si no existen usuarios reales)
  async createTestUsers() {
    console.log('👥 Verificando usuarios existentes...')
    
    // Primero verificar si ya existen usuarios reales
    const { data: existingUsers, error: checkError } = await supabase
      .from('user_profiles')
      .select('*')
    
    if (checkError) {
      console.error('Error checking existing users:', checkError)
      return
    }
    
    if (existingUsers && existingUsers.length > 0) {
      console.log(`✅ Ya existen ${existingUsers.length} usuarios en el sistema`)
      console.log('⏩ Saltando creación de usuarios de prueba')
      return
    }
    
    console.log('📝 No hay usuarios existentes, verificando usuario actual...')
    
    // Obtener el usuario actual autenticado para usarlo como base
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (!currentUser) {
      console.warn('⚠️ No hay usuario autenticado. No se pueden crear perfiles.')
      return
    }
    
    // Verificar si el usuario actual ya tiene perfil
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single()
    
    if (!currentProfile) {
      console.log('👤 Creando perfil para usuario actual...')
      
      // Obtener roles disponibles
      const { data: roles } = await supabase
        .from('roles')
        .select('id, name')

      if (!roles) {
        console.error('No se pudieron obtener los roles')
        return
      }

      // Determinar rol basado en el email
      let roleId = roles.find(r => r.name === 'jp')?.id // JP por defecto
      if (currentUser.email?.includes('admin')) {
        roleId = roles.find(r => r.name === 'admin')?.id
      } else if (currentUser.email?.includes('gerente') || currentUser.email?.includes('manager')) {
        roleId = roles.find(r => r.name === 'gerente')?.id
      }
      
      if (!roleId) {
        console.error('No se pudo determinar el rol del usuario')
        return
      }
      
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: currentUser.id,
          employee_id: 'USR001',
          full_name: currentUser.email?.split('@')[0]?.replace('.', ' ') || 'Usuario',
          email: currentUser.email || '',
          role_id: roleId,
          department: 'General'
        })
      
      if (profileError) {
        console.error('Error creando perfil de usuario:', profileError)
      } else {
        console.log('✅ Perfil de usuario creado exitosamente')
      }
    } else {
      console.log('✅ El usuario actual ya tiene perfil')
    }
    
    console.log('✅ Configuración de usuarios completada - Listo para MVP')
  },

  // Función para resetear el sistema (mantener solo usuario actual)
  async removeTestUsers() {
    try {
      console.log('� Verificando sistema para MVP...')
      
      // Obtener usuario actual
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        console.warn('⚠️ No hay usuario autenticado')
        return false
      }
      
      // Verificar cuántos usuarios hay
      const { data: allUsers, error: countError } = await supabase
        .from('user_profiles')
        .select('id, email, full_name')
      
      if (countError) {
        console.error('Error verificando usuarios:', countError)
        return false
      }
      
      if (!allUsers || allUsers.length === 0) {
        console.log('✅ No hay usuarios adicionales para eliminar')
        return true
      }
      
      if (allUsers.length === 1 && allUsers[0].id === currentUser.id) {
        console.log('✅ Solo existe el usuario actual - Sistema listo para MVP')
        return true
      }
      
      console.log(`📊 Encontrados ${allUsers.length} usuarios en el sistema`)
      console.log('👤 Usuario actual será preservado:', currentUser.email)
      
      // En un MVP real, normalmente no eliminarías otros usuarios automáticamente
      // Solo mostrar información
      const otherUsers = allUsers.filter(u => u.id !== currentUser.id)
      if (otherUsers.length > 0) {
        console.log(`📝 Otros usuarios en el sistema (${otherUsers.length}):`)
        otherUsers.forEach(u => console.log(`  - ${u.full_name} (${u.email})`))
      }
      
      console.log('✅ Sistema verificado - Listo para MVP')
      return true
    } catch (error) {
      console.error('❌ Error verificando sistema:', error)
      return false
    }
  },

  // Función para demostrar ventajas del campo user_state vs is_active
  async demonstrateUserStateAdvantages() {
    try {
      console.log('🎯 Demostrando ventajas de user_state vs is_active...')
      console.log('')
      
      // 1. Mostrar limitaciones del sistema actual (is_active)
      console.log('❌ LIMITACIONES DEL SISTEMA ACTUAL (is_active):')
      console.log('   • Solo 2 estados: true/false (activo/inactivo)')
      console.log('   • No diferencia entre "bloqueado" y "eliminado"')
      console.log('   • Difícil agregar nuevos estados como "pendiente"')
      console.log('   • Queries confusas: WHERE is_active = false (¿bloqueado o eliminado?)')
      console.log('')
      
      // 2. Mostrar ventajas del nuevo sistema (user_state)
      console.log('✅ VENTAJAS DEL NUEVO SISTEMA (user_state):')
      console.log('   • Estados específicos: 0=Bloqueado, 1=Activo, 2=Eliminado, 3=Pendiente')
      console.log('   • Queries claras: WHERE user_state = 0 (específicamente bloqueados)')
      console.log('   • Fácil agregar nuevos estados sin cambiar estructura')
      console.log('   • Mejor auditoría y reportes por estado específico')
      console.log('   • Más escalable para crecer el sistema')
      console.log('')
      
      // 3. Demostrar datos actuales
      const { userService } = await import('./userService')
      const users = await userService.getAllUsersWithStatus()
      
      console.log('📊 ANÁLISIS DE DATOS ACTUALES:')
      console.log(`   • Total usuarios: ${users.length}`)
      
      const activeCount = users.filter(u => u.is_active === true).length
      const inactiveCount = users.filter(u => u.is_active === false).length
      
      console.log(`   • is_active = true: ${activeCount} usuarios`)
      console.log(`   • is_active = false: ${inactiveCount} usuarios`)
      console.log('')
      console.log('❓ PROBLEMA: Los "false" podrían ser bloqueados O eliminados')
      console.log('   No hay forma de distinguir sin campo adicional')
      console.log('')
      
      // 4. Mostrar cómo sería con user_state
      console.log('💡 CON EL NUEVO SISTEMA (user_state):')
      console.log(`   • Activos (state=1): ${activeCount} usuarios`)
      console.log(`   • Bloqueados (state=0): ${Math.floor(inactiveCount/2)} usuarios estimados`)
      console.log(`   • Eliminados (state=2): ${Math.ceil(inactiveCount/2)} usuarios estimados`)
      console.log('   • Pendientes (state=3): 0 usuarios (nuevo estado disponible)')
      console.log('')
      
      // 5. Mostrar ejemplos de queries
      console.log('🔍 EJEMPLOS DE QUERIES:')
      console.log('')
      console.log('   ANTES (confuso):')
      console.log('   SELECT * FROM user_profiles WHERE is_active = false;')
      console.log('   -- ¿Son bloqueados o eliminados? 🤔')
      console.log('')
      console.log('   DESPUÉS (claro):')
      console.log('   SELECT * FROM user_profiles WHERE user_state = 0; -- Solo bloqueados')
      console.log('   SELECT * FROM user_profiles WHERE user_state = 2; -- Solo eliminados') 
      console.log('   SELECT * FROM user_profiles WHERE user_state IN (0,2); -- Inactivos')
      console.log('')
      
      // 6. Recomendación
      console.log('🎯 RECOMENDACIÓN:')
      console.log('   ✅ SÍ, cambiar de is_active a user_state')
      console.log('   ✅ Usar script de migración: migrate_user_state.sql')
      console.log('   ✅ Mantener compatibilidad durante transición')
      console.log('   ✅ Eliminar is_active una vez migrado completamente')
      console.log('')
      
      // 7. Plan de implementación
      console.log('📋 PLAN DE IMPLEMENTACIÓN:')
      console.log('   1. Ejecutar migrate_user_state.sql')
      console.log('   2. Actualizar tipos TypeScript')
      console.log('   3. Actualizar servicios (ya hecho)')
      console.log('   4. Actualizar componentes UI')
      console.log('   5. Probar funcionalidad completa')
      console.log('   6. Eliminar is_active cuando todo funcione')
      console.log('')
      
      return true
    } catch (error) {
      console.error('❌ Error demostrando ventajas:', error)
      return false
    }
  },

  // Función para probar la gestión de estados de usuario
  async testUserStatusManagement() {
    try {
      console.log('👥 Probando gestión de estados de usuario...')
      
      // Importar userService
      const { userService } = await import('./userService')
      
      // 1. Obtener estadísticas actuales
      console.log('📊 Obteniendo estadísticas de usuarios...')
      const stats = await userService.getUserStatusStats()
      console.log(`✅ Estadísticas:`)
      console.log(`  - Activos: ${stats.active}`)
      console.log(`  - Bloqueados: ${stats.blocked}`)
      console.log(`  - Eliminados: ${stats.deleted}`)
      console.log(`  - Total: ${stats.total}`)
      
      // 2. Obtener todos los usuarios con estado
      console.log('👤 Obteniendo todos los usuarios...')
      const allUsers = await userService.getAllUsersWithStatus()
      console.log(`✅ ${allUsers.length} usuarios encontrados`)
      
      allUsers.forEach(user => {
        const status = user.is_active ? 'Activo' : 'Bloqueado/Eliminado'
        console.log(`  - ${user.full_name} (${user.email}): ${status}`)
      })
      
      // 3. Mostrar usuarios activos
      console.log('✅ Obteniendo solo usuarios activos...')
      const activeUsers = await userService.getUsersByStatus(1) // UserStatus.ACTIVE
      console.log(`✅ ${activeUsers.length} usuarios activos`)
      
      // 4. Verificar funcionalidad de verificación de permisos
      if (allUsers.length > 0) {
        const testUser = allUsers[0]
        console.log(`🔍 Verificando permisos para ${testUser.full_name}...`)
        const canPerformActions = await userService.canUserPerformActions(testUser.id)
        console.log(`✅ ¿Puede realizar acciones? ${canPerformActions ? 'Sí' : 'No'}`)
      }
      
      console.log('🎉 Prueba de gestión de estados completada')
      console.log('')
      console.log('📋 Funciones disponibles:')
      console.log('  • userService.activateUser(userId, reason)')
      console.log('  • userService.blockUser(userId, reason)')
      console.log('  • userService.deleteUser(userId, reason)')
      console.log('  • userService.getUserStatusStats()')
      console.log('  • userService.getAllUsersWithStatus()')
      console.log('  • userService.canUserPerformActions(userId)')
      
      return true
    } catch (error) {
      console.error('❌ Error en prueba de gestión de estados:', error)
      return false
    }
  },

  // Función para verificar el estado actual del sistema
  async checkSystemStatus() {
    try {
      console.log('🔍 Verificando estado del sistema...')
      
      // 1. Verificar roles
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select('*')
      
      if (rolesError) {
        console.error('❌ Error verificando roles:', rolesError)
        return false
      }
      
      console.log(`✅ Roles: ${roles?.length || 0} encontrados`)
      roles?.forEach(role => console.log(`  - ${role.name}`))
      
      // 2. Verificar usuarios
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, employee_id, full_name, email, department, roles(name)')
      
      if (usersError) {
        console.error('❌ Error verificando usuarios:', usersError)
        return false
      }
      
      console.log(`✅ Usuarios: ${users?.length || 0} encontrados`)
      users?.forEach(user => {
        const roleName = (user.roles as { name: string } | null)?.name || 'Sin rol'
        console.log(`  - ${user.full_name} (${user.email}) - ${roleName}`)
      })
      
      // 3. Verificar proyectos
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
      
      if (projectsError) {
        console.error('❌ Error verificando proyectos:', projectsError)
        return false
      }
      
      console.log(`✅ Proyectos: ${projects?.length || 0} encontrados`)
      projects?.forEach(project => console.log(`  - ${project.name} (${project.code}) - ${project.status}`))
      
      // 4. Verificar entradas de tiempo
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select('*')
      
      if (timeError && timeError.code !== 'PGRST116') {
        console.error('❌ Error verificando entradas de tiempo:', timeError)
      } else {
        console.log(`✅ Entradas de tiempo: ${timeEntries?.length || 0} encontradas`)
      }
      
      // 5. Verificar usuario actual
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (currentUser) {
        console.log(`👤 Usuario actual: ${currentUser.email}`)
      } else {
        console.warn('⚠️ No hay usuario autenticado')
      }
      
      console.log('🎉 Verificación del sistema completada')
      return true
      
    } catch (error) {
      console.error('❌ Error verificando sistema:', error)
      return false
    }
  },

  // Función para limpiar todos los datos de prueba
  async clearTestData() {
    try {
      console.log('🧹 Iniciando limpieza de datos de prueba...')

      // 1. Eliminar asignaciones de proyectos
      console.log('🔗 Eliminando asignaciones de proyectos...')
      const { error: assignmentsError } = await supabase
        .from('project_assignments')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Eliminar todos

      if (assignmentsError && assignmentsError.code !== 'PGRST116') { // PGRST116 = tabla no existe
        console.warn('⚠️ Error eliminando asignaciones:', assignmentsError)
      } else {
        console.log('✅ Asignaciones eliminadas')
      }

      // 2. Eliminar entradas de tiempo
      console.log('⏰ Eliminando entradas de tiempo...')
      const { error: timeEntriesError } = await supabase
        .from('time_entries')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Eliminar todos

      if (timeEntriesError && timeEntriesError.code !== 'PGRST116') {
        console.warn('⚠️ Error eliminando entradas de tiempo:', timeEntriesError)
      } else {
        console.log('✅ Entradas de tiempo eliminadas')
      }

      // 3. Eliminar proyectos
      console.log('📁 Eliminando proyectos...')
      const { error: projectsError } = await supabase
        .from('projects')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Eliminar todos

      if (projectsError) {
        console.warn('⚠️ Error eliminando proyectos:', projectsError)
      } else {
        console.log('✅ Proyectos eliminados')
      }

      // 4. Eliminar perfiles de usuario (excepto usuarios autenticados actuales)
      console.log('👥 Eliminando perfiles de usuario de prueba...')
      const { data: { user } } = await supabase.auth.getUser()

      let userProfilesQuery = supabase
        .from('user_profiles')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Base query

      // Si hay un usuario actual, no eliminarlo
      if (user) {
        userProfilesQuery = userProfilesQuery.neq('id', user.id)
      }

      const { error: userProfilesError } = await userProfilesQuery

      if (userProfilesError) {
        console.warn('⚠️ Error eliminando perfiles de usuario:', userProfilesError)
      } else {
        console.log('✅ Perfiles de usuario eliminados')
      }

      // Nota: No eliminamos roles ya que son estructurales del sistema

      console.log('🎉 Limpieza de datos completada')
      return true
    } catch (error) {
      console.error('❌ Error durante la limpieza:', error)
      return false
    }
  },

  // Función para inicializar datos de prueba
  async initializeTestData() {
    try {
      await this.createRoles()
      await this.createTestUsers()
      console.log('Test data initialized successfully')
    } catch (error) {
      console.error('Error initializing test data:', error)
    }
  }
}
