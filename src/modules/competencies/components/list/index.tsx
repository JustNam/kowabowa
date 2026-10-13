'use client'
// Dòng trên bắt buộc: file này chạy trên trình duyệt (có state, nút bấm).

// ============================================================
// QUY ƯỚC TRONG FILE NÀY
//   - Code viết đầy đủ: phần quan trọng, mới với bạn. Đọc kỹ comment.
//   - 👉 TỰ VIẾT: phần đơn giản, bạn tự gõ theo hướng dẫn.
//     Bí thì mở file index.full.tsx (bản hoàn chỉnh) để đối chiếu.
//
// CẤU TRÚC: trang được lắp từ các component nhỏ, lồng vào nhau như búp bê Nga
//
//   CompetenciesList            (cả trang: nút, ô tìm kiếm, 2 nhóm)
//     ├─ SkillGroup "My skills"       (tiêu đề nhóm + danh sách)
//     │    └─ SkillItem × n            (một dòng skill)
//     │         └─ SkillActions        (nút Edit / Delete)
//     └─ SkillGroup "System skills"
//          └─ SkillItem × n
//               └─ SkillActions        (nút mờ + tooltip)
//
// Đọc file từ dưới lên trên (component nhỏ nhất trước) sẽ dễ hiểu hơn.
// ============================================================

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

// đổi format từ timestamp sang định dạng như trong wireframe
function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ============================================================
// COMPONENT 1: Tạo component SkillActions, 2 nút Edit / Delete của một skill
// ============================================================

// 👉 TỰ VIẾT: khai báo props, đặt tên ISkillActionsProps, gồm 3 thông tin:
//   - skill: kiểu ICompetencyModel
//   - onEdit: một hàm, nhận vào một skill (kiểu ICompetencyModel), không trả gì
//   - onDelete: giống onEdit
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
      <div className="flex gap-1">
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

        {/* 👉 TỰ VIẾT: tooltip cho nút Delete.*/}
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
    <div className="flex gap-1">
      {/* Khi bấm: gọi hàm onEdit cha đưa xuống, kèm skill của dòng này,
          để cha biết người dùng muốn sửa skill nào.
          Phải có "() =>" ở đầu, nếu không hàm chạy ngay khi vẽ, không chờ bấm. */}
      <IconButton size="small" aria-label="Edit" onClick={() => props.onEdit(props.skill)}>
        <EditOutlinedIcon fontSize="small" />
      </IconButton>

      {/* 👉 TỰ VIẾT: nút Delete. Copy nút Edit ở trên rồi sửa:*/}
      <IconButton size="small" aria-label="Delete" onClick={() => props.onDelete(props.skill)}>
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
    </div>
  )
}

// ============================================================
// COMPONENT 2: SkillItem, một dòng skill trong danh sách
// Bên trái: tên + mô tả. Bên phải: ngày tạo + nút.
// ============================================================

// 👉 TỰ VIẾT: khai báo props, đặt tên ISkillItemProps.
// Giống hệt ISkillActionsProps (skill, onEdit, onDelete), copy rồi đổi tên.
// Vì sao SkillItem cũng cần onEdit, onDelete dù nó không tự dùng?
// Vì nó phải "chuyền tay" 2 hàm này xuống cho SkillActions bên trong nó.
interface ISkillItemProps {
  skill: ICompetencyModel
  onEdit: (skill: ICompetencyModel) => void
  onDelete: (skill: ICompetencyModel) => void
}

function SkillItem(props: ISkillItemProps) {
  return (
    // justify-between: phần đầu dạt trái, phần cuối dạt phải.
    // py-3: khoảng cách trên dưới mỗi dòng.
    <li className="flex items-center justify-between gap-4 py-3">
      {/* Bên trái: tên và mô tả, xếp dọc */}
      <div className="flex flex-col">
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {props.skill.title}
        </Typography>

        {/* 👉 TỰ VIẾT: mô tả, chỉ hiện khi props.skill.description khác null.
              Dùng mẫu "A && B" như đã học, với B là
              <Typography variant="body2" color="text.secondary"> chứa mô tả.
              color="text.secondary" lấy màu chữ phụ từ theme, không viết mã màu. */}
      {/* ?.trim(): null, '' hoặc toàn khoảng trắng đều thành rỗng/undefined -> không hiện */}
      {props.skill.description?.trim() && (
        <Typography variant="body2" color="text.secondary">
          {props.skill.description}
        </Typography>
      )}
      </div>

      {/* Bên phải: ngày tạo và nút, xếp ngang */}
      <div className="flex items-center gap-4">
        {/* 👉 TỰ VIẾT: ngày tạo. Một Typography giống mô tả ở trên,
              nội dung là {formatDate(props.skill.createdAt)} */}
        <Typography variant="body2" color="text.secondary">
          {formatDate(props.skill.createdAt)}
        </Typography>
        {/* Chuyền tay: lấy skill và 2 hàm nhận từ cha, đưa tiếp xuống SkillActions */}
        <SkillActions skill={props.skill} onEdit={props.onEdit} onDelete={props.onDelete} />
      </div>
    </li>
  )
}

// ============================================================
// COMPONENT 3: SkillGroup, một nhóm skill (tiêu đề + danh sách)
// Dùng 2 lần: một cho "My skills", một cho "System skills".
// Viết 1 lần, dùng nhiều lần, chỉ cần đưa vào dữ liệu khác nhau.
// ============================================================
interface ISkillGroupProps {
  title: string                                    // tên nhóm, ví dụ "My skills"
  skills: ICompetencyModel[]                       // các skill thuộc nhóm này (một MẢNG)
  emptyMessage: string                             // câu hiện ra khi nhóm không có skill nào
  onEdit: (skill: ICompetencyModel) => void        // chuyền tay xuống SkillItem
  onDelete: (skill: ICompetencyModel) => void      // chuyền tay xuống SkillItem
}

function SkillGroup(props: ISkillGroupProps) {
  return (
    <section className="flex flex-col gap-2">
      {/* Tiêu đề nhóm kèm số lượng, ví dụ "My skills (3)" */}
      <Typography variant="subtitle2">
        {props.title} ({props.skills.length})
      </Typography>

      {/* 👉 TỰ VIẾT: nếu props.skills.length bằng 0 thì hiện props.emptyMessage,
            trong <Typography variant="body2" color="text.secondary">.
            Dùng mẫu "A && B". */}
      {props.skills.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          {props.emptyMessage}
        </Typography>
      )}
      {/* Có ít nhất 1 skill thì hiện danh sách trong một khung viền (Paper outlined). */}
      {props.skills.length > 0 && (
        <Paper variant="outlined">
          <ul className="flex flex-col px-4">
            {/* .map: mỗi skill -> một SkillItem.
                key đặt trên SkillItem (thứ được .map tạo ra), không đặt bên trong nó.
                key không phải props: SkillItem không đọc được key, nó chỉ dành cho React. */}
            {props.skills.map((skill) => (
              <SkillItem
                key={skill.id}
                skill={skill}
                onEdit={props.onEdit}
                onDelete={props.onDelete}
              />
            ))}
          </ul>
        </Paper>
      )}
    </section>
  )
}

// ============================================================
// COMPONENT CHÍNH: CompetenciesList, cả trang
// ============================================================
export function CompetenciesList() {
  // ----- State tải dữ liệu (giữ nguyên từ file mẫu) -----
  const [skills, setSkills] = useState<ICompetencyModel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [search, setSearch] = useState ('')
  // 👉 TỰ VIẾT: state search, setSearch: chữ gõ vào ô tìm kiếm, ban đầu là ''

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

  // ----- Edit / Delete: CHƯA làm -----
  // CompetenciesApi chưa có hàm update và remove (BE đã có PATCH và DELETE).
  // Tạm thời chỉ in ra tab Console của trình duyệt (F12) để thử nút bấm.
  function handleEdit(skill: ICompetencyModel) {
    // TODO: mở modal sửa skill. Sửa xong gọi setReloadKey((k) => k + 1)
    console.log('Edit', skill.id)
  }
  function handleDelete(skill: ICompetencyModel) {
    // TODO: mở modal xác nhận xoá (src/atoms/modal).
    // BE trả lỗi 409 "Skill is used in logs" nếu skill đang được dùng trong log.
    console.log('Delete', skill.id)
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

  // Bước 2: tách 2 nhóm TỪ danh sách đã lọc (không phải từ skills gốc),
  // để tìm kiếm áp dụng cho cả hai nhóm.
  const mySkills = filteredSkills.filter((skill) => skill.isSystem === false)
  // 👉 TỰ VIẾT: systemSkills, giống dòng trên nhưng isSystem === true
  const systemSkills = filteredSkills.filter((skill) => skill.isSystem === true)
  // Bước 3: có đang tìm kiếm không? Dùng để chọn câu thông báo khi nhóm trống.
  const isSearching = keyword !== ''

  return (
    <div className="flex flex-col gap-4">
      {/* Nút Add skill (giữ nguyên từ file mẫu) */}
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>Add skill</Button>
      </div>

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
        onChange={(event) => setSearch(event.target.value)}
        className="w-full max-w-xs"
        slotProps={{
          input: {
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

      {/* Chỉ hiện 2 nhóm khi tải xong và không lỗi. Nếu không bọc, lúc đang
          tải hay lỗi sẽ hiện nhầm "No skills yet" vì skills vẫn là [].
          <> </> gom 2 nhóm lại, vì sau && chỉ đặt được MỘT phần tử. */}
      {!loading && !error && (
        <>
          {/* Dùng SkillGroup lần 1: nhóm của người dùng.
              emptyMessage chọn bằng "điều kiện ? A : B" (đúng thì A, sai thì B):
              đang tìm mà không thấy -> báo không khớp; không tìm -> mời tạo skill. */}
          <SkillGroup
            title="My skills"
            skills={mySkills}
            emptyMessage={isSearching ? 'No skills match your search.' : 'No skills yet. Add your first one.'}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* 👉 TỰ VIẾT: dùng SkillGroup lần 2 cho skill hệ thống. Copy khối trên rồi sửa:
                - title là "System skills"
                - skills là systemSkills
                - emptyMessage: khi không tìm kiếm thì dùng 'No system skills.'
              onEdit, onDelete giữ nguyên: SkillActions tự biết skill hệ thống
              thì làm mờ nút, nên không cần xử lý riêng ở đây. */}

          <SkillGroup
            title="System skills"
            skills={systemSkills}
            emptyMessage={isSearching ? 'No skills match your search.' : 'No system skills.'}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      )}

      {/* Modal tạo skill (giữ nguyên từ file mẫu) */}
      <CompetenciesCreate
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setReloadKey((k) => k + 1)}
      />
    </div>
  )
}
