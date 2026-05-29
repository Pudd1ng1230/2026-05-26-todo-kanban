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
