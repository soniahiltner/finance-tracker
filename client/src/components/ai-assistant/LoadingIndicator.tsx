import React from 'react'
import { Bot, Loader2 } from 'lucide-react'

export const LoadingIndicator = React.memo(() => {
  return (
    <div className='flex justify-start'>
      <div className='flex items-start space-x-2 max-w-[80%]'>
        <div className='shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-primary-500 to-purple-600 flex items-center justify-center'>
          <Bot className='w-5 h-5 text-white' />
        </div>
        <div className='rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-700'>
          <div className='flex items-center space-x-2'>
            <Loader2 className='w-4 h-4 animate-spin text-primary-600 dark:text-primary-400' />
            <span className='text-sm text-gray-600 dark:text-gray-300'>
              Pensando...
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})

LoadingIndicator.displayName = 'LoadingIndicator'
