/**
 * SearchBar — 搜索框
 *
 * 每次输入变化时实时调用 onSearch(keyword)。
 * 空字符串触发重置（重新加载全部任务）。
 *
 * @param {Function} onSearch(keyword) — 搜索回调
 */

import { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <input
      className="search-bar"
      type="text"
      value={value}
      onChange={handleChange}
      placeholder="🔍 搜索卡片..."
    />
  );
}
