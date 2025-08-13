import { supabase } from '@/services/supabase'
import { projectService } from '@/services/projectService'

// Script de prueba para verificar la conectividad y funcionalidad de la base de datos
export const testDatabaseConnection = async () => {
  console.log('🔍 Iniciando pruebas de conectividad de base de datos...')

  try {
    // 1. Verificar conectividad básica
    console.log('📡 Verificando conectividad...')
    const { data: _testData, error: testError } = await supabase
      .from('roles')
      .select('*')
      .limit(1)

    if (testError) {
      console.error('❌ Error de conectividad:', testError)
      return false
    }
    console.log('✅ Conectividad OK')

    // 2. Verificar estructura de tablas
    console.log('🏗️ Verificando estructura de tablas...')

    // Verificar tabla roles
    const { data: _roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .limit(1)

    if (rolesError) {
      console.error('❌ Tabla roles no existe:', rolesError)
      return false
    }
    console.log('✅ Tabla roles OK')

    // Verificar tabla projects
    const { data: _projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(1)

    if (projectsError) {
      console.error('❌ Tabla projects no existe:', projectsError)
      return false
    }
    console.log('✅ Tabla projects OK')

    // Verificar tabla user_profiles
    const { data: _users, error: usersError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)

    if (usersError) {
      console.error('❌ Tabla user_profiles no existe:', usersError)
      return false
    }
    console.log('✅ Tabla user_profiles OK')

    // 3. Verificar datos básicos
    console.log('🌱 Verificando datos básicos...')
    const { data: rolesData } = await supabase
      .from('roles')
      .select('*')

    if (!rolesData || rolesData.length === 0) {
      console.warn('⚠️ No hay roles en la base de datos')
    } else {
      console.log(`✅ ${rolesData.length} roles encontrados`)
    }

    // 4. Probar creación de proyecto
    console.log('📁 Probando creación de proyecto...')
    const testProject = {
      code: 'TEST-001',
      name: 'Proyecto de Prueba',
      description: 'Proyecto para probar la funcionalidad',
      start_date: new Date().toISOString().split('T')[0]
    }

    try {
      const newProject = await projectService.createProject(testProject)
      console.log('✅ Proyecto creado exitosamente:', newProject.code)

      // Limpiar proyecto de prueba
      await projectService.deleteProject(newProject.id)
      console.log('🧹 Proyecto de prueba eliminado')

    } catch (projectError) {
      console.error('❌ Error creando proyecto:', projectError)
      return false
    }

    console.log('🎉 ¡Todas las pruebas pasaron! El sistema está listo para agregar proyectos.')
    return true

  } catch (error) {
    console.error('❌ Error general en las pruebas:', error)
    return false
  }
}

// Función específica para probar la gestión de proyectos
export const testProjectManagement = async () => {
  console.log('📁 Probando funcionalidades de gestión de proyectos...')

  try {
    // 1. Obtener proyectos existentes
    const existingProjects = await projectService.getProjects()
    console.log(`📋 Proyectos existentes: ${existingProjects.length}`)

    // 2. Obtener JPs disponibles
    const availableJPs = await projectService.getAvailableJPs()
    console.log(`👥 JPs disponibles: ${availableJPs.length}`)

    // 3. Crear proyecto de prueba con asignaciones
    const testProject = {
      code: `TEST-${Date.now()}`,
      name: 'Proyecto de Prueba Completa',
      description: 'Proyecto para probar todas las funcionalidades',
      start_date: new Date().toISOString().split('T')[0],
      assigned_jps: availableJPs.slice(0, 2).map(jp => jp.id) // Asignar primeros 2 JPs
    }

    const newProject = await projectService.createProject(testProject)
    console.log('✅ Proyecto creado con asignaciones:', newProject.code)

    // 4. Actualizar proyecto
    const _updatedProject = await projectService.updateProject(newProject.id, {
      description: 'Descripción actualizada',
      status: 'active'
    })
    console.log('✅ Proyecto actualizado')

    // 5. Obtener proyecto específico
    const _projectDetail = await projectService.getProjectById(newProject.id)
    console.log('✅ Detalle de proyecto obtenido')

    // 6. Limpiar
    await projectService.deleteProject(newProject.id)
    console.log('🧹 Proyecto de prueba eliminado')

    console.log('🎉 ¡Gestión de proyectos funciona perfectamente!')
    return true

  } catch (error) {
    console.error('❌ Error en gestión de proyectos:', error)
    console.error('Detalles:', String(error))
    return false
  }
}
