

import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { BoardSquare, WorldPhase } from '../types';
import { BOARD_SIZE } from '../constants';
import { UserIcon, StarIcon, ExclamationTriangleIcon, QuestionMarkCircleIcon, ScaleIcon, FlagIcon, SparklesIcon, SunIcon, ZapIcon, ZapOffIcon, BrainIcon, ScrollIcon, SwordIcon, HomeIcon, HammerIcon, BriefcaseIcon, MeteorIcon, MinusCircleIcon, ChevronLeftIcon, ChevronRightIcon, DiceIcon } from './Icons';
import { SmartTooltip } from './SmartTooltip';

interface GameBoardProps {
  board: BoardSquare[];
  playerPosition: number;
  worldPhase: WorldPhase | null;
  // Collapse props
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  // Dice roll props
  diceRolls: number;
  handleDiceRoll: () => void;
  isLoading: boolean;
  isRolling: boolean;
  diceFace: number;
  isInTribulation: boolean;
}


const PlayerToken: React.FC = () => (
    <div className="absolute inset-0 flex items-center justify-center z-10 animate-pulse">
        <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-full border-2 border-white shadow-[0_0_15px_5px_rgba(252,211,77,0.5)]"></div>
    </div>
);

const SquareIcon: React.FC<{ type: BoardSquare['type'] }> = ({ type }) => {
    const iconClass = "w-6 h-6 opacity-80";
    switch (type) {
        case 'Khởi đầu': return <HomeIcon className={`${iconClass} text-lime-400`} />;
        case 'Sự kiện': return <QuestionMarkCircleIcon className={`${iconClass} text-purple-400`} />;
        case 'May mắn': return <StarIcon className={`${iconClass} text-green-400`} />;
        case 'Xui xẻo': return <ExclamationTriangleIcon className={`${iconClass} text-red-500`} />;
        case 'Cột mốc': return <FlagIcon className={`${iconClass} text-yellow-400`} />;
        case 'Kỳ Ngộ': return <SparklesIcon className={`${iconClass} text-cyan-300 animate-pulse`} />;
        case 'Tâm Ma': return <BrainIcon className={`${iconClass} text-purple-500`} />;
        case 'Nhân Quả': return <ScaleIcon className={`${iconClass} text-gray-400`} />;
        case 'Thiên Cơ': return <ScrollIcon className={`${iconClass} text-blue-300`} />;
        case 'Thử Luyện': return <SwordIcon className={`${iconClass} text-orange-400`} />;
        case 'Bế Quan': return <HomeIcon className={`${iconClass} text-white`} />;
        case 'Hồng Trần': return <UserIcon className={`${iconClass} text-pink-400`} />;
        case 'Linh Mạch': return <ZapIcon className={`${iconClass} text-blue-400 animate-pulse`} />;
        case 'Pháp Bảo': return <HammerIcon className={`${iconClass} text-yellow-500`} />;
        case 'Giao Dịch': return <BriefcaseIcon className={`${iconClass} text-emerald-400`} />;
        case 'Tai Ương': return <MeteorIcon className={`${iconClass} text-orange-600`} />;
        case 'Ô Trống': return <MinusCircleIcon className={`${iconClass} text-slate-500`} />;
        default: return <div className="w-6 h-6"></div>;
    }
};

const GameBoard: React.FC<GameBoardProps> = ({ 
    board, 
    playerPosition, 
    worldPhase,
    isCollapsed,
    onToggleCollapse,
    diceRolls,
    handleDiceRoll,
    isLoading,
    isRolling,
    diceFace,
    isInTribulation
}) => {
    const [isCenterTooltipVisible, setIsCenterTooltipVisible] = useState(false);
    
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const orbRef = React.useRef<HTMLDivElement>(null);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node) && orbRef.current && !orbRef.current.contains(event.target as Node)) {
                 setIsCenterTooltipVisible(false);
            }
        };

        if (isCenterTooltipVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCenterTooltipVisible]);

    // Handle Mobile view separately - it never collapses and has its own layout for the dice button.
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    if (isMobile) {
        // Mobile view doesn't use the collapse/expand logic and the dice button is rendered in App.tsx
         return (
             <div className="w-full h-full flex items-center justify-center p-1 md:p-2">
                {/* Board rendering logic is the same */}
                 <BoardGrid board={board} playerPosition={playerPosition} worldPhase={worldPhase} orbRef={orbRef} tooltipRef={tooltipRef} isCenterTooltipVisible={isCenterTooltipVisible} setIsCenterTooltipVisible={setIsCenterTooltipVisible} />
             </div>
         );
    }
    

    if (isCollapsed) {
        return (
            <div 
                onClick={onToggleCollapse}
                className="relative flex-shrink-0 w-20 h-20 bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl shadow-black/20 flex items-center justify-center cursor-pointer group hover:border-yellow-400/80 transition-all duration-300 ease-in-out"
                title="Thiên Mệnh Bàn"
                aria-label="Mở rộng bảng Thiên Mệnh Bàn"
            >
                <SparklesIcon className="w-10 h-10 text-yellow-300 group-hover:text-yellow-100 transition-colors" />
                {diceRolls > 0 && (
                    <div className="absolute top-1 right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-slate-900" aria-label={`${diceRolls} lượt lắc xúc xắc có sẵn`}>
                        {diceRolls}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex-shrink-0 w-full md:w-[500px] h-fit flex flex-col bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl shadow-black/20 transition-all duration-300 ease-in-out">
          {/* Panel Header */}
          <div className="flex-shrink-0 flex items-center justify-between gap-3 text-lg font-bold p-3 border-b border-slate-700/50 text-yellow-300">
            <div className="flex items-center gap-3">
              <SparklesIcon className="w-6 h-6" />
              <span>Thiên Mệnh Bàn</span>
            </div>
            <button onClick={onToggleCollapse} className="p-1 rounded-full hover:bg-slate-700/50 transition-colors" aria-label="Thu gọn bảng Thiên Mệnh Bàn">
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
    
          {/* Board Content */}
          <div className="w-full flex items-center justify-center p-1 md:p-2">
              <BoardGrid board={board} playerPosition={playerPosition} worldPhase={worldPhase} orbRef={orbRef} tooltipRef={tooltipRef} isCenterTooltipVisible={isCenterTooltipVisible} setIsCenterTooltipVisible={setIsCenterTooltipVisible} />
          </div>
    
          {/* Dice Roll UI */}
          <div className="flex-shrink-0 p-4 border-t-2 border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-yellow-300">Điều Khiển</h3>
              <span className="text-sm text-gray-400">Cứ 20 lượt sẽ được 1 lần lắc</span>
            </div>
            <button onClick={() => handleDiceRoll()} disabled={isLoading || diceRolls <= 0 || isRolling || isInTribulation} className="w-full flex items-center justify-center gap-3 px-6 py-3 font-bold text-lg rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900 shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed disabled:scale-100">
              <DiceIcon className={`w-7 h-7 ${isRolling ? 'animate-dice-roll' : ''}`} face={diceFace} />
              <span>Lắc Xúc Xắc ({diceRolls})</span>
            </button>
          </div>
        </div>
    );
};


// Extracted the board grid into its own component to reduce repetition
const BoardGrid = ({ board, playerPosition, worldPhase, orbRef, tooltipRef, isCenterTooltipVisible, setIsCenterTooltipVisible }: any) => {

    const [activeSquareTooltip, setActiveSquareTooltip] = useState<number | null>(null);
    const [hoveredSquare, setHoveredSquare] = useState<number | null>(null);
    const squareRefs = useRef<(HTMLDivElement | null)[]>([]);

    if (board.length === 0) {
        return <div className="w-full h-full flex items-center justify-center text-white">Đang tạo thế giới...</div>;
    }

    const sideLength = BOARD_SIZE / 4;
    const gridSize = sideLength + 1;

    const cells = board.map((cell: BoardSquare, i: number) => {
        if (!cell) return null;
        const isPlayerHere = i === playerPosition;

        let gridRow, gridColumn;
        
        if (i >= 0 && i < sideLength) { // Bottom row
            gridRow = gridSize;
            gridColumn = i + 1;
        } else if (i >= sideLength && i < sideLength * 2) { // Right column
            gridRow = gridSize - (i - sideLength);
            gridColumn = gridSize;
        } else if (i >= sideLength * 2 && i < sideLength * 3) { // Top row
            gridRow = 1;
            gridColumn = gridSize - (i - sideLength * 2);
        } else { // Left column
            gridRow = 1 + (i - sideLength * 3);
            gridColumn = 1;
        }
        
        const gridPosition = { gridRow, gridColumn };

        return (
            <div
                key={cell.id}
                ref={el => { squareRefs.current[i] = el; }}
                style={gridPosition}
                className={`group relative p-2 rounded-lg bg-slate-800/60 text-white text-xs flex items-center justify-center text-center shadow-lg border-2 border-slate-700/50 hover:border-yellow-400/80 transition-all duration-300 cursor-pointer ${isPlayerHere ? 'ring-2 ring-yellow-300 scale-105 shadow-yellow-400/20 z-20' : 'z-10'} hover:z-30`}
                onClick={(e) => {
                    e.stopPropagation();
                    setActiveSquareTooltip((prev: number | null) => prev === i ? null : i)
                }}
                onMouseEnter={() => setHoveredSquare(i)}
                onMouseLeave={() => setHoveredSquare(null)}
            >
                <SquareIcon type={cell.type} />
                {isPlayerHere && <PlayerToken />}
            </div>
        );
    });
    
    const worldEffects = worldPhase?.effects.filter((e: any) => e.target === 'world');
    const boardEffects = worldPhase?.effects.filter((e: any) => e.target === 'board');

    const tooltipIndex = activeSquareTooltip ?? hoveredSquare;
    const targetElement = tooltipIndex !== null ? squareRefs.current[tooltipIndex] : null;
    const cellData = tooltipIndex !== null && board[tooltipIndex] ? board[tooltipIndex] : null;

    return (
        <>
            <div 
                className={`grid gap-1 sm:gap-2 max-w-full max-h-full aspect-square`}
                style={{
                    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                    gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                }}
                onClick={() => setActiveSquareTooltip(null)}
            >
                {cells}
                {/* Center Area for World Phase */}
                <div className="relative col-start-2 col-span-8 row-start-2 row-span-8 flex items-center justify-center text-center">
                    {worldPhase ? (
                        <div className="relative flex items-center justify-center">
                            {/* The orb itself - now clickable */}
                            <div 
                                ref={orbRef}
                                className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-slate-800 via-purple-900/50 to-slate-900 border-2 border-purple-600/70 shadow-[0_0_20px_theme(colors.purple.600),inset_0_0_10px_theme(colors.purple.900)] flex flex-col items-center justify-center p-2 transition-all duration-300 cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); setIsCenterTooltipVisible(!isCenterTooltipVisible);}}
                            >
                                <SunIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-yellow-300 animate-pulse mb-1" />
                                <h3 className="text-xs sm:text-sm md:text-md font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">{worldPhase.name}</h3>
                            </div>
                        </div>
                    ) : (
                        <p>Thiên địa hỗn mang...</p>
                    )}
                </div>
            </div>

            {/* Tooltips rendered via Portal */}
            {cellData && (
                <SmartTooltip
                    show={!!targetElement}
                    target={targetElement}
                    className="w-max max-w-xs p-2 text-center text-sm bg-slate-900 border border-yellow-500/50 rounded-lg shadow-xl"
                >
                    <p className="font-bold text-yellow-300">{cellData.type}</p>
                    <p>{cellData.description}</p>
                </SmartTooltip>
            )}

            {worldPhase && (
                 <SmartTooltip
                    ref={tooltipRef}
                    show={isCenterTooltipVisible}
                    target={orbRef.current}
                    className="w-72 sm:w-80 p-4 text-left bg-slate-900/90 backdrop-blur-sm border border-yellow-500/50 rounded-lg shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">{worldPhase.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 my-2">{worldPhase.description}</p>
                    <div className="w-full text-xs space-y-2 max-h-48 styled-scrollbar pr-2 overflow-y-auto">
                        {worldEffects && worldEffects.length > 0 && (
                            <div>
                                <p className="font-semibold text-slate-300 text-sm mb-1">Ảnh hưởng Thế Giới</p>
                                {worldEffects.map((effect: any, i: number) => (
                                    <div key={`world-${i}`} className="flex items-start gap-2">
                                        {effect.type === 'buff' ? <ZapIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" /> : <ZapOffIcon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                                        <p className={`text-left ${effect.type === 'buff' ? 'text-green-300' : 'text-red-300'}`}>{effect.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {boardEffects && boardEffects.length > 0 && (
                            <div className="pt-2 mt-2 border-t border-slate-700/50">
                                <p className="font-semibold text-slate-300 text-sm mb-1">Ảnh hưởng Bàn Cờ</p>
                                {boardEffects.map((effect: any, i: number) => (
                                    <div key={`board-${i}`} className="flex items-start gap-2">
                                        {effect.type === 'buff' ? <ZapIcon className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" /> : <ZapOffIcon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
                                        <p className={`text-left ${effect.type === 'buff' ? 'text-green-300' : 'text-red-300'}`}>{effect.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-300 pt-2 border-t border-slate-700/50">Thiên địa luân chuyển sau: {worldPhase.turnsRemaining} lượt</p>
                </SmartTooltip>
            )}
        </>
    );
}


export default GameBoard;