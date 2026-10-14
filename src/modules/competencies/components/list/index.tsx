'use client'
//   CompetenciesList       
//     ├─ ô Search   
//     │    └─ SkillTable       
//     │         └─ SkillRow × 8
//                    └─ SkillActions  
//     └─ dòng "Showing…" + Pagination

// Đọc file từ dưới lên trên (component nhỏ nhất trước) sẽ dễ hiểu hơn.
// ============================================================
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

// đổi format từ timestamp sang định dạng như trong wireframe
function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

//quy định số item trên 1 page giới hạn ở 8
const PAGE_SIZE = 8

// ============================================================
// COMPONENT 1: Tạo component SkillActions, 2 nút Edit / Delete của một skill
// ============================================================

interface ISkillActionsProps {
  skill: ICompetencyModel
  onEdit: (skill:ICompetencyModel) => void
  onDelete: (skill:ICompetencyModel) => void
}

function SkillActions(props: ISkillActionsProps) {
  // Skill isSystem hệ thống: 2 nút mờ, hover hiện tooltip
  // return bên trong if: là skill isSystem thì trả giao diện này rồi dừng.
  if (props.skill.isSystem) {
    return (
      <div className="flex justify-end gap-1">
        {/* QUAN TRỌNG: nút disabled KHÔNG nhận sự kiện hover chuột.
            Đặt Tooltip thẳng lên nút disabled thì tooltip không bao giờ hiện.
            Cách xử lý: bọc nút trong <span>. Tooltip nghe hover trên <span>,
            mà <span> thì không bị disabled. */}
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

  // ----- Skill của người dùng: 2 nút bình thường -----
  return (
    <div className="flex justify-end gap-1">
      {/* Khi bấm: gọi hàm onEdit cha đưa xuống, kèm skill của dòng này,
          để cha biết người dùng muốn sửa skill nào.
          Phải có "() =>" ở đầu, nếu không hàm chạy ngay khi vẽ, không chờ bấm. */}
      <IconButton size="small" aria-label="Edit" onClick={() => props.onEdit(props.skill)}>
        <EditOutlinedIcon fontSize="small" />
      </IconButton>

      <IconButton size="small" aria-label="Delete" onClick={() => props.onDelete(props.skill)}>
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    </div>
  )
}

// ============================================================
// COMPONENT 2: SkillRow, một dòng skill trong table
// ============================================================

// Vì sao SkillRow cũng cần onEdit, onDelete dù nó không tự dùng?
// Vì nó phải "chuyền tay" 2 hàm này xuống cho SkillActions bên trong nó.
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

// ============================================================
// COMPONENT 3: SkillTable, cả bảng
// ============================================================
interface ISkillTableProps {
  skills: ICompetencyModel[]                   // CHỈ các skill của trang hiện tại (tối đa 8)
  emptyMessage: string                         // Câu hiện khi không có skill nào
  onEdit: (skill: ICompetencyModel) => void
  onDelete: (skill: ICompetencyModel) => void
}

const headCellSx = {
  fontSize: 12,
  fontWeight: 600,
  color: 'text.secondary',      // 📖 chữ xám (màu chữ phụ trong theme)
  textTransform: 'uppercase',   // 📖 tự viết HOA → trong code vẫn gõ "Skill" bình thường
  bgcolor: 'grey.100',          // 📖 nền xám nhạt cho hàng tiêu đề, như wireframe
} as const

function SkillTable(props: ISkillTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            {/* width: đặt độ rộng cho cột để các trang không bị nhảy độ rộng
                  khi tên skill dài/ngắn khác nhau. Cột DESCRIPTION không đặt → lấy phần còn lại. */}
            <TableCell sx={{ ...headCellSx, width: '25%' }}>Skill</TableCell>
            <TableCell sx={headCellSx}>Description</TableCell>
            <TableCell sx={{ ...headCellSx, width: 140 }}>Created at</TableCell>
            <TableCell sx={{ ...headCellSx, width: 100 }} align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        {/* 📖 { ...headCellSx, width: '25%' }: dấu ... (spread) = "chép toàn bộ style
              trong headCellSx vào đây, rồi thêm width". */}

        <TableBody>
          {/* nếu props.skills.length === 0 thì hiện MỘT dòng thông báo*/}
              {props.skills.length === 0 && (
                <TableRow>
                  {/* 📖 colSpan={4}: một ô "trải dài" qua cả 4 cột.*/}
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

// ============================================================
// COMPONENT CHÍNH: CompetenciesList, cả trang
// ============================================================
export function CompetenciesList() {
  // ----- State tải dữ liệu (giữ nguyên từ file mẫu) -----
  const [page, setPage] = useState(1)
  const [skills, setSkills] = useState<ICompetencyModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [search, setSearch] = useState ('')
  const [editingSkill, setEditingSkill] = useState<ICompetencyModel | null>(null)
  const [deletingSkill, setDeletingSkill] = useState<ICompetencyModel | null>(null)

  // ----- Tải danh sách (giữ nguyên từ file mẫu, đã giải thích trước) -----
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

  // ----- Edit / Delete -----
  // CompetenciesApi chưa có hàm update và remove (BE đã có PATCH và DELETE).
  // Tạm thời chỉ in ra tab Console của trình duyệt (F12) để thử nút bấm.
  function handleEdit(skill: ICompetencyModel) {
    // mở modal sửa skill. Sửa xong gọi setReloadKey((k) => k + 1)
    setEditingSkill(skill)
  }
  function handleDelete(skill: ICompetencyModel) {
    // mở modal xác nhận xoá (src/atoms/modal).
    // BE trả lỗi 409 "Skill is used in logs" nếu skill đang được dùng trong log.
    setDeletingSkill(skill)
  }

  // ----- Tính dữ liệu để hiển thị -----
  // Biến thường, KHÔNG phải state: mỗi lần skills hoặc search đổi, React vẽ lại
  // và chạy lại các dòng này, nên kết quả luôn mới.

  // Bước 1: lọc theo ô tìm kiếm.
  //   - .trim(): bỏ khoảng trắng hai đầu
  //   - .toLowerCase(): đổi thành chữ thường, gõ "design" vẫn khớp "Design"
  //   - .includes(keyword): title có CHỨA keyword ở bất kỳ đâu không
  // Ô trống -> keyword là '' -> mọi title đều chứa '' -> giữ tất cả.
  const keyword = search.trim().toLowerCase()
  const filteredSkills = skills.filter((skill) =>
    skill.title.toLowerCase().includes(keyword)
  )
  const isSearching = keyword !== ''
  // 📖 Tổng số trang. Ví dụ 11 skill, mỗi trang 8:
  //    11 / 8 = 1.375  →  Math.ceil (làm tròn LÊN) = 2 trang.
  //    Math.max(1, ...): khi không có skill nào (0 / 8 = 0) vẫn coi là có 1 trang,
  //    tránh trường hợp "trang 1 / 0".
  const totalPages = Math.max(1, Math.ceil(filteredSkills.length/ PAGE_SIZE))
  // 📖 Trang đang xem — không được vượt quá tổng số trang.
  //    Ví dụ: đang ở trang 2 (có đúng 1 skill), xoá skill đó → chỉ còn 1 trang.
  //    page vẫn là 2 → bảng trống. Math.min(2, 1) = 1 → tự quay về trang 1.
  const currentPage = Math.min(page, totalPages)

  // 📖 Vị trí bắt đầu cắt. Trang 1 → 0, trang 2 → 8, trang 3 → 16...
  //    (Mảng đếm từ 0, nên skill đầu tiên ở vị trí 0.)
  const startIndex = (currentPage - 1) * PAGE_SIZE

  // 📖 .slice(bắt_đầu, kết_thúc): cắt ra một đoạn của mảng, KHÔNG lấy phần tử ở vị trí kết_thúc.
  //    Trang 1: slice(0, 8)  → vị trí 0..7  (8 skill)
  //    Trang 2: slice(8, 16) → vị trí 8..15 (nếu chỉ có 11 skill thì lấy 8..10, tự dừng)
  const pageSkills = filteredSkills.slice(startIndex, startIndex + PAGE_SIZE)

  // 📖 Số cho dòng "Showing 1–8 of 11 skills"
  //    Trang 2 của 11 skill: from = 9, to = 8 + 3 = 11  →  "Showing 9–11 of 11 skills"
  const from = startIndex + 1
  const to = startIndex + pageSkills.length

  

  return (
    <PageLayout
      title="Skills"
      actions={<Button onClick={() => setCreateOpen(true)}>Add skill</Button>}
    >
      <div className="flex flex-col gap-4">

      {/* Ô tìm kiếm có icon kính lúp.
          - value + onChange: ô "có kiểm soát", giống ô Title ở 6a
          - slotProps.input.startAdornment: gắn thêm một thứ vào ĐẦU ô nhập
            (adornment = đồ trang trí), ở đây là icon kính lúp
          Nếu build báo lỗi ở slotProps (MUI bản cũ), đổi thành:
            InputProps={{ startAdornment: ( ...giữ nguyên phần bên trong... ) }} */}
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

      {/* Đang tải và báo lỗi (giữ nguyên) */}
      {loading && <CircularProgress size={24} />}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Chỉ hiện bảng khi tải xong và không lỗi. Nếu không bọc, lúc đang
          tải hay lỗi sẽ hiện nhầm "No skills yet" vì skills vẫn là [].
          <> </> gom bảng lại, vì sau && chỉ đặt được MỘT phần tử. */}
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

              {/* 📖 Pagination của MUI tự vẽ nút ‹ 1 2 3 › và tự biết khi nào làm mờ ‹ ›.
                    - count: tổng số trang
                    - page: trang đang được chọn (tô đen)
                    - onChange: bấm sang trang khác → MUI gọi hàm này,
                      tham số thứ 2 (value) là SỐ TRANG vừa bấm.
                      Tham số thứ 1 (_event) không dùng → đặt tên có dấu _ ở đầu
                      để báo "cố ý bỏ qua".
                    - shape="rounded" + variant="outlined": nút vuông bo góc có viền, như wireframe */}
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

      {/* Modal tạo skill (giữ nguyên từ file mẫu) */}
      <CompetenciesCreate
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setReloadKey((k) => k + 1)}
      />
        {editingSkill && (
          <CompetenciesEdit
            key={editingSkill.id}
            skill={editingSkill}
            onClose={() => setEditingSkill(null)}        // 📖 về null = đóng popup
            onSaved={() => setReloadKey((k) => k + 1)}   // 📖 tải lại list, giống Create
          />
        )}
        {deletingSkill && (
          <CompetenciesDelete
            key={deletingSkill.id}
            skill={deletingSkill}
            onClose={() => setDeletingSkill(null)}        // 📖 về null = đóng popup
            onDeleted={() => setReloadKey((k) => k + 1)}   // 📖 tải lại list, giống Create
          />
        )}
    </div>
    </PageLayout>
  )
}
