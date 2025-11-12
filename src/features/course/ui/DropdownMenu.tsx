import { Icon } from '@/shared/icons/icon';
import { Button } from '@/shared/ui/primitives/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger
} from '@/shared/ui/primitives/dropdown-menu';

export type SortType = 'distance' | 'recommended' | 'alphabet';

const itemTitle = {
  distance: '가까운 순',
  recommended: '추천 순',
  alphabet: '가나다 순'
};

interface DropDownProps {
  checkedValue: SortType;
  onCheckedChange: (value: SortType) => void;
}

const CourseDropdownMenu = ({
  checkedValue,
  onCheckedChange
}: DropDownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='secondary'
          className='flex items-center gap-1 rounded-full px-3 py-2'
        >
          <span className='text-contents-r15'>{itemTitle[checkedValue]}</span>
          <Icon
            name='drop_down'
            size={12}
            color='currentColor'
            className='text-g-60'
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        <DropdownMenuGroup>
          <DropdownMenuCheckboxItem
            checked={checkedValue === 'distance'}
            onCheckedChange={(checked) =>
              checked && onCheckedChange('distance')
            }
          >
            {itemTitle['distance']}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={checkedValue === 'recommended'}
            onCheckedChange={(checked) =>
              checked && onCheckedChange('recommended')
            }
          >
            {itemTitle['recommended']}
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={checkedValue === 'alphabet'}
            onCheckedChange={(checked) =>
              checked && onCheckedChange('alphabet')
            }
          >
            {itemTitle['alphabet']}
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CourseDropdownMenu;
