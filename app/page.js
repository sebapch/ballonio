import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex items-center justify-center h-screen bg-blue-200">
      <Link href="/game" className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
        Iniciar Juego
      </Link>
    </div>
  )
}