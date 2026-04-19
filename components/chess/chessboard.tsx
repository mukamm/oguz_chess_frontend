"use client"

import { useState, useCallback, useEffect } from "react"
import { Chess } from "chess.js"
import { cn } from "@/lib/utils"

const pieceSymbols: Record<string, string> = {
  k: "♚", K: "♔",
  q: "♛", Q: "♕",
  r: "♜", R: "♖",
  b: "♝", B: "♗",
  n: "♞", N: "♘",
  p: "♟", P: "♙",
}

interface ChessboardProps {
  fen?: string
  onMove?: (uciMove: string) => void
  disabled?: boolean
  flipped?: boolean  // для чёрных — доска перевёрнута
}

export function Chessboard({ fen, onMove, disabled = false, flipped = false }: ChessboardProps) {
  const [chess, setChess] = useState(() => {
    const c = new Chess()
    if (fen && fen !== "start") c.load(fen)
    return c
  })
  const [board, setBoard] = useState(() => chess.board())
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [validMoves, setValidMoves] = useState<string[]>([])
  const [lastMove, setLastMove] = useState<[string, string] | null>(null)

  // обновляем доску когда приходит новый fen с сервера
  useEffect(() => {
    if (!fen) return
    const c = new Chess()
    if (fen !== "start") c.load(fen)
    setChess(c)
    setBoard(c.board())
    setSelectedSquare(null)
    setValidMoves([])
  }, [fen])

  const getSquareName = (row: number, col: number): string => {
    const r = flipped ? row : 7 - row
    const c = flipped ? 7 - col : col
    return `${String.fromCharCode(97 + c)}${r + 1}`
  }

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (disabled) return
    const square = getSquareName(row, col)

    if (selectedSquare) {
      if (validMoves.includes(square)) {
        // делаем ход
        const uciMove = `${selectedSquare}${square}`
        const newChess = new Chess(chess.fen())
        newChess.move({ from: selectedSquare, to: square, promotion: "q" })
        setChess(newChess)
        setBoard(newChess.board())
        setLastMove([selectedSquare, square])
        onMove?.(uciMove)
        setSelectedSquare(null)
        setValidMoves([])
      } else {
        // выбираем другую фигуру
        const moves = chess.moves({ square: square as any, verbose: true })
        if (moves.length > 0) {
          setSelectedSquare(square)
          setValidMoves(moves.map(m => m.to))
        } else {
          setSelectedSquare(null)
          setValidMoves([])
        }
      }
    } else {
      const moves = chess.moves({ square: square as any, verbose: true })
      if (moves.length > 0) {
        setSelectedSquare(square)
        setValidMoves(moves.map(m => m.to))
      }
    }
  }, [chess, selectedSquare, validMoves, disabled, flipped, onMove])

  const rows = flipped ? [0,1,2,3,4,5,6,7] : [0,1,2,3,4,5,6,7]
  const cols = [0,1,2,3,4,5,6,7]

  return (
    <div className="relative pl-4 sm:pl-6">
      <div className="grid grid-cols-8 border-2 border-border rounded-lg overflow-hidden shadow-2xl">
        {rows.map((row) =>
          cols.map((col) => {
            const square = getSquareName(row, col)
            const boardRow = flipped ? 7 - row : row
            const boardCol = flipped ? 7 - col : col
            const piece = board[boardRow]?.[boardCol]
            const pieceChar = piece
              ? piece.color === "w"
                ? piece.type.toUpperCase()
                : piece.type.toLowerCase()
              : ""

            const isLight = (row + col) % 2 === 0
            const isSelected = selectedSquare === square
            const isValidMove = validMoves.includes(square)
            const isLastMove = lastMove && (lastMove[0] === square || lastMove[1] === square)

            return (
              <button
                key={`${row}-${col}`}
                onClick={() => handleSquareClick(row, col)}
                disabled={disabled}
                className={cn(
                  "aspect-square w-full flex items-center justify-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl transition-all duration-150 relative",
                  isLight
                    ? "bg-[#E8EDF9] dark:bg-[#B7C0D8]"
                    : "bg-[#B7C0D8] dark:bg-[#7B8BB0]",
                  isSelected && "ring-2 sm:ring-4 ring-inset ring-primary",
                  isLastMove && "bg-primary/30",
                  !disabled && "hover:brightness-110 cursor-pointer"
                )}
              >
                {isValidMove && (
                  <div className={cn(
                    "absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary/50",
                    pieceChar && "w-full h-full rounded-none bg-primary/20 border-2 sm:border-4 border-primary/50"
                  )} />
                )}
                {pieceChar && (
                  <span className={cn(
                    "relative z-10 select-none drop-shadow-md",
                    piece?.color === "w"
                      ? "text-white [text-shadow:_0_1px_2px_rgb(0_0_0_/_60%)]"
                      : "text-gray-900"
                  )}>
                    {pieceSymbols[pieceChar]}
                  </span>
                )}
              </button>
            )
          })
        )}
      </div>

      {/* File labels */}
      <div className="flex justify-around mt-1.5 sm:mt-2 px-1 sm:px-2">
        {(flipped
          ? ["h","g","f","e","d","c","b","a"]
          : ["a","b","c","d","e","f","g","h"]
        ).map(file => (
          <span key={file} className="text-[10px] sm:text-xs text-muted-foreground font-medium">
            {file}
          </span>
        ))}
      </div>

      {/* Rank labels */}
      <div className="absolute left-0 top-0 bottom-6 sm:bottom-8 flex flex-col justify-around py-1 sm:py-2">
        {(flipped ? [1,2,3,4,5,6,7,8] : [8,7,6,5,4,3,2,1]).map(rank => (
          <span key={rank} className="text-[10px] sm:text-xs text-muted-foreground font-medium">
            {rank}
          </span>
        ))}
      </div>
    </div>
  )
}