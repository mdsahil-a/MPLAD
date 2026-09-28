import React from 'react'
import { createContext, useContext, useState } from 'react'

// Optional global state - only needed if pages start sharing filter/search state.
const ProjectContext = createContext(null)

export function ProjectProvider({ children }){
  const [filters, setFilters] = useState({ tier: 'all', query: '' })
  return (
    <ProjectContext.Provider value={{ filters, setFilters }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProjectContext(){
  return useContext(ProjectContext)
}
