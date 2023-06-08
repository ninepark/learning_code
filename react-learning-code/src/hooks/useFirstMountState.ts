import { useRef } from 'react';

/**
 * 컴포넌트의 마운트 후 첫 번째 렌더링 상태인지 확인
 * - streamich/react-use: https://github.com/streamich/react-use/blob/master/src/useFirstMountState.ts
 */
export default function useFirstMountState(): boolean {
    const isFirst = useRef(true);

    if (isFirst.current) {
        isFirst.current = false;

        return true;
    }

    return isFirst.current;
}
