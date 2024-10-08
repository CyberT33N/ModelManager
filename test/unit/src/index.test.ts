/*
███████████████████████████████████████████████████████████████████████████████
██******************** PRESENTED BY t33n Software ***************************██
██                                                                           ██
██                  ████████╗██████╗ ██████╗ ███╗   ██╗                      ██
██                  ╚══██╔══╝╚════██╗╚════██╗████╗  ██║                      ██
██                     ██║    █████╔╝ █████╔╝██╔██╗ ██║                      ██
██                     ██║    ╚═══██╗ ╚═══██╗██║╚██╗██║                      ██
██                     ██║   ██████╔╝██████╔╝██║ ╚████║                      ██
██                     ╚═╝   ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝                      ██
██                                                                           ██
███████████████████████████████████████████████████████████████████████████████
███████████████████████████████████████████████████████████████████████████████
*/

import { describe, it, expect } from 'vitest'

import {
    ModelManager,
    MongooseUtils,
    ModelUtils
} from '@/src/index'

describe('[UNIT TEST] - src/index.ts', () => {
    describe('[CODE]', () => {
        it('should have ModelManager class', () => {
            expect(ModelManager).toBeDefined()
        })

        it('should have MongooseUtils class', () => {
            expect(MongooseUtils).toBeDefined()
        })

        it('should have ModelUtils class', () => {
            expect(ModelUtils).toBeDefined()
        })
    })
})