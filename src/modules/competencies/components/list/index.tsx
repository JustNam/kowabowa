'use client'

import { useEffect, useState } from 'react'
import Chip from '@mui/material/Chip'
import { CompetenciesApi } from '@/api/competencies'
import { Button } from '@/atoms/button'
import type { ICompetencyModel } from '@/interfaces/competency.model'
import { CompetenciesCreate } from '../create'
import IconButton from '@mui/material/IconButton'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import SearchIcon from '@mui/icons-material/Search'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

export function CompetenciesList() {
  // Tạo một state tên skills, giá trị ban đầu lấy từ list trong interface ICompetencyModel với dạng rỗng, sau đó tùy thuộc giá trị được gán cho setSkills mà có sự thay đổi
  const [skills, setSkills] = useState<ICompetencyModel[]>([])
  // Tạo một state tên loading, giá trị ban đầu là true. useState nhờ React giữ giá trị hiện tại của lần vẽ lại giao diện gần nhất, setLoading giúp thay đổi giá trị đó.
  const [loading, setLoading] = useState(true)
  // Tạo một state tên error, giá trị string hoặc không có gì cả, giá trị ban đầu là không có gì cả - không hiển thị error. Dùng setError để thay đổi giá trị về sau
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  // Tạo một state tên reloadKey, giá trị ban đầu = 0. Dùng setReloadKey để thay đổi giá trị về sau
  // mục đích yêu cầu useEffect chạy lại, nhằm tránh việc gọi BE tải list liên tục, vì có thêm 1 [] ở cuối. Số lần yêu cầu useEffect (tải list) được define bởi reload key
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    // khai báo biến (variables) tên cancelled = false, gắn kèm useEffect để đánh dấu điều kiện chạy effect này. Trạng thái ban đầu là "chưa cancelled"
    let cancelled = false
    // BE được lồng trong effect thay vì để chạy ngoài (nằm trực tiếp trong component), nhằm đảm bảo chỉ gọi BE nếu đạt đúng điều kiện, không cho gọi liên tục
    CompetenciesApi.list()
    //PROMISE - Javascript - chạy khi BE trả danh sách thành công
      .then(({ data }) => {
      // kiểm tra trạng thái của biến cancelled, nếu false thì tiếp tục re render, nếu true thì hủy
      // kiểm tra state của useEffect, nếu là false thì trả về skill list
      // tiện thể xóa luôn state error (nếu gặp ở trước đó)
        if (cancelled) return
        setSkills(data)
        setError(null)
      })
    //PROMISE - Javascript - chạy khi BE trả danh sách thất bại (lỗi 401, 404, 500 ...)
      .catch(() => {
        // nếu không phải trạng thái cancelled thì trả lỗi 
        if (!cancelled) setError('Could not load your skills.')
      })
    //PROMISE - Javascript - luôn chạy sau điều kiện thành công/ thất bại ở trên. Dùng để tắt hiệu ứng
      .finally(() => {
        // nếu không phải trạng thái cancelled thì trả về trạng thái loading false - tắt trạng thái load
        if (!cancelled) setLoading(false)
      })
    // đánh dấu trạng thái cancelled = true -> use effect đã hết hạn, bỏ qua câu trả lời của BE
    return () => {
      cancelled = true
    }
    // gọi BE lấy danh sách mới
  }, [reloadKey])



  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>Add skill</Button>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading skills…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && skills.length === 0 && (
        <p className="text-sm text-gray-500">No skills yet. Add your first one.</p>
      )}

      // define skill người dùng và skill predefine riêng
      {userSkills.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <li key={skill.id}>
              <Chip label={skill.name} />
            </li>
          ))}
        </ul>
      )}

      <CompetenciesCreate
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => setReloadKey((k) => k + 1)}
      />
    </div>
  )
}
