'use client'
import { PageLayout } from '@/components/PageLayout'
import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import SearchIcon from '@mui/icons-material/Search'
import { CompetenciesApi } from '@/api/competencies'
import { Button } from '@/atoms/button'
import type { ICompetencyModel } from '@/interfaces/competency.model'
import { CompetenciesCreate } from '../create'
import { CompetenciesEdit } from '../edit'
import { CompetenciesDelete } from '../delete'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'   
import TableCell from '@mui/material/TableCell'         
import TableContainer from '@mui/material/TableContainer'
import Pagination from '@mui/material/Pagination'

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const PAGE_SIZE = 8

interface ISkillActionsProps {
  skill: ICompetencyModel
  onEdit: (skill:ICompetencyModel) => void
  onDelete: (skill:ICompetencyModel) => void
}

function SkillActions(props: ISkillActionsProps) {
  if (props.skill.isSystem) {
    return (
      <div className="flex justify-end gap-1">
        <Tooltip title="System skills can't be edited">
          <span>
            <IconButton size="small" disabled aria-label="Edit">
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="System skills can't be deleted">
          <span>
            <IconButton size="small" disabled aria-label="Delete">
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className="flex justify-end gap-1">
      <IconButton size="small" aria-label="Edit" onClick={() => props.onEdit(props.skill)}>
        <EditOutlinedIcon fontSize="small" />
      </IconButton>

      <IconButton size="small" aria-label="Delete" onClick={() => props.onDelete(props.skill)}>
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    </div>
  )
}

interface ISkillRowProps {
  skill: ICompetencyModel
  onEdit: (skill: ICompetencyModel) => void
  onDelete: (skill: ICompetencyModel) => void
}

function SkillRow(props: ISkillRowProps) {
  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {props.skill.title}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {props.skill.description}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          {formatDate(props.skill.createdAt)}
        </Typography>
      </TableCell>

      <TableCell align="right">
          <SkillActions skill={props.skill} onEdit={props.onEdit} onDelete={props.onDelete} />
      </TableCell>
    </TableRow>
  )
}

interface ISkillTableProps {
  skills: ICompetencyModel[]
  emptyMessage: string
  onEdit: (skill: ICompetencyModel) => void
  onDelete: (skill: ICompetencyModel) => void
}

const headCellSx = {
  fontSize: 12,
  fontWeight: 600,
  color: 'text.secondary',
  textTransform: 'uppercase',
  bgcolor: 'grey.100',
} as const

function SkillTable(props: ISkillTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...headCellSx, width: '25%' }}>Skill</TableCell>
            <TableCell sx={headCellSx}>Description</TableCell>
            <TableCell sx={{ ...headCellSx, width: 140 }}>Created at</TableCell>
            <TableCell sx={{ ...headCellSx, width: 100 }} align="right">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
              {props.skills.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {props.emptyMessage}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

            {props.skills.map((skill) => (
              <SkillRow
                key={skill.id}
                skill={skill}
                onEdit={props.onEdit}
                onDelete={props.onDelete}
              />
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export function CompetenciesList() {
  const [page, setPage] = useState(1)
  const [skills, setSkills] = useState<ICompetencyModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [search, setSearch] = useState ('')
  const [editingSkill, setEditingSkill] = useState<ICompetencyModel | null>(null)
  const [deletingSkill, setDeletingSkill] = useState<ICompetencyModel | null>(null)

  useEffect(() => {
    let cancelled = false

    CompetenciesApi.list()
      .then(({ data }) => {
        if (cancelled) return
        setSkills(data)
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your skills.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  function handleEdit(skill: ICompetencyModel) {
    setEditingSkill(skill)
  }
  function handleDelete(skill: ICompetencyModel) {
    setDeletingSkill(skill)
  }

  const keyword = search.trim().toLowerCase()
  const filteredSkills = skills.filter((skill) =>
    skill.title.toLowerCase().includes(keyword)
  )
  const isSearching = keyword !== ''
  const totalPages = Math.max(1, Math.ceil(filteredSkills.length/ PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const startIndex = (currentPage - 1) * PAGE_SIZE

  const pageSkills = filteredSkills.slice(startIndex, startIndex + PAGE_SIZE)

  const from = startIndex + 1
  const to = startIndex + pageSkills.length

  

  return (
    <PageLayout
      title="Skills"
      actions={<Button onClick={() => setCreateOpen(true)}>Add skill</Button>}
    >
      <div className="flex flex-col gap-4">

      <TextField
        size="small"
        placeholder="Search skill"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value)
          setPage(1)
        }}
        className="w-full max-w-xs"
        slotProps={{
          input: {
            sx: { bgcolor: 'background.paper' },
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      {loading && <CircularProgress size={24} />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && (
        <>
          <SkillTable
            skills={pageSkills}
            emptyMessage={isSearching ? 'No skills match your search.' : 'No skills yet. Add your first one.'}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {filteredSkills.length > 0 && (
            <div className="flex items-center justify-between">
              <Typography variant="body2" color="text.secondary">
                Showing {from}–{to} of {filteredSkills.length} skills
              </Typography>

              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_event, value) => setPage(value)}
                shape="rounded"
                variant="outlined"
                color="primary"
              />
            </div>
          )}
        </>
      )}

      <CompetenciesCreate
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setReloadKey((k) => k + 1)}
      />
        {editingSkill && (
          <CompetenciesEdit
            key={editingSkill.id}
            skill={editingSkill}
            onClose={() => setEditingSkill(null)}
            onSaved={() => setReloadKey((k) => k + 1)}
          />
        )}
        {deletingSkill && (
          <CompetenciesDelete
            key={deletingSkill.id}
            skill={deletingSkill}
            onClose={() => setDeletingSkill(null)}
            onDeleted={() => setReloadKey((k) => k + 1)}
          />
        )}
    </div>
    </PageLayout>
  )
}
