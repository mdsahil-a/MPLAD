import { createContext, useContext, useState } from 'react'

// Optional global state - only needed if pages start sharing filter/search state,
// or once real API data replaces mockData.js and multiple pages need the same fetch.
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
