import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '../config/config';

const GeneratedLetters = ({ letters }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [localLetters, setLocalLetters] = useState(letters);

  useEffect(() => {
    setLocalLetters(letters);
  }, [letters]);

  const filteredLetters = localLetters.filter(letter =>
    letter.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleAuthorization = async (letterId, currentStatus) => {
    try {
      setUpdatingId(letterId);
      await axios.patch(`${config.apiUrl}/users/${letterId}/authorize`, {
        authorized: !currentStatus,
      });

      setLocalLetters(prev =>
        prev.map(l =>
          l._id === letterId ? { ...l, authorized: !currentStatus } : l
        )
      );

      toast.success(
        `Letter marked as ${!currentStatus ? 'authorized' : 'unauthorized'}.`,
        { position: 'bottom-right' }
      );
    } catch (error) {
      console.error('Error updating authorization:', error);
      toast.error('Failed to update letter status.', { position: 'bottom-right' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-neutral-900 rounded-lg p-6 w-full lg:w-96 custom-scrollbar">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-300 border-l-4 border-green-500 pl-3">
          Generated Letters
        </h3>
        <span className="text-2xl font-bold text-amber-400">{localLetters.length}</span>
      </div>

      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded-full bg-neutral-800 text-white placeholder-gray-400 focus:outline-none"
      />

      <div className="text-sm text-gray-300 max-h-96 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {filteredLetters.length === 0 ? (
          <div className="text-gray-400">No Letter found.</div>
        ) : (
          filteredLetters.map((letter, index) => {
            const date = new Date(letter.createdAt);
            const dateStr = date.toLocaleDateString();
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const isHovered = hoveredIndex === index;
            const isExpanded = expandedIndex === index;

            return (
              <div
                key={letter._id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setExpandedIndex(prev => (prev === index ? null : index))}
                className="relative pb-3 border-b border-white/10 mt-4 cursor-pointer transition-all duration-300"
              >
                {/* Main Info */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-white">
                      {letter.studentName}{' '}
                      {!letter.authorized && (
                        <span className="text-amber-400 text-xs font-normal">
                          (Unauthorized Letter)
                        </span>
                      )}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {letter.fatherName} | {letter.course}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <p>{dateStr}</p>
                    <p>{timeStr}</p>
                  </div>
                </div>

                {/* Arrow */}
                {(isHovered || (isExpanded && isHovered)) && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-1 animate-bounce z-10">
                    {isExpanded ? (
                      <ChevronUp className="text-white w-5 h-5" />
                    ) : (
                      <ChevronDown className="text-white w-5 h-5" />
                    )}
                  </div>
                )}

                {/* Expanded Actions */}
                {isExpanded && (
                  <div className="mt-3 bg-red-900/30 text-red-300 text-sm p-3 rounded-md">
                    <p className="mb-2">
                      {letter.authorized
                        ? '⚠️ Mark this letter as unauthorized.'
                        : '✅ Authorize this letter.'}
                    </p>
                    <button
                      className={`${letter.authorized ? 'bg-red-700 hover:bg-red-800' : 'bg-green-700 hover:bg-green-800'
                        } text-white px-4 py-1 rounded disabled:opacity-50`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAuthorization(letter._id, letter.authorized);
                      }}
                      disabled={updatingId === letter._id}
                    >
                      {updatingId === letter._id
                        ? 'Updating...'
                        : letter.authorized
                          ? 'Unauthorize'
                          : 'Authorize'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GeneratedLetters;
