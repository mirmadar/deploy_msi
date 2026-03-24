import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  CircularProgress,
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  KeyboardArrowRight as KeyboardArrowRightIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Photo as PhotoIcon,
  FilterList as FilterListIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { styles } from "./styles/CategoryTreeNode.styles";

export const CategoryTreeNode = ({
  node,
  level,
  parentId,
  indexInSiblings = 0,
  siblingsCount = 1,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onManageFilters,
  fetchChildren,
  childrenCache,
  loadingChildren,
  selectedCategories = [],
  onSelect,
  onMoveUp,
  onMoveDown,
  isMovingOrder = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [moreAnchorEl, setMoreAnchorEl] = useState(null);
  const isExpanded = expanded.has(node.categoryId);
  const hasChildren = node.hasChildren !== undefined ? node.hasChildren : false;
  const localChildren = childrenCache[node.categoryId] || [];

  // Бэкенд отдаёт по sortOrder; для единообразия сортируем по sortOrder
  const sortedChildren = localChildren.length > 0
    ? [...localChildren].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
    : [];

  const isLoadingChildren = loadingChildren[node.categoryId];
  const isSelected = selectedCategories.includes(node.categoryId);

  const canMoveUp = indexInSiblings > 0 && !isMovingOrder;
  const canMoveDown = indexInSiblings < siblingsCount - 1 && !isMovingOrder;
  const isMoreOpen = Boolean(moreAnchorEl);

  const openMoreMenu = (event) => {
    event.stopPropagation();
    setMoreAnchorEl(event.currentTarget);
  };

  const closeMoreMenu = () => setMoreAnchorEl(null);

  const runActionAndClose = (action) => {
    action?.();
    closeMoreMenu();
  };

  return (
    <Box>
      <Box sx={styles.nodeRow}>
        <Box sx={styles.nodeContent}>
          {/* Чекбокс для выбора */}
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelect && onSelect(node.categoryId, e.target.checked)}
            size="small"
            sx={styles.checkbox}
            onClick={(e) => e.stopPropagation()}
          />

          {!isMobile && (
            <Box sx={styles.idCell}>
              <Typography variant="body2" sx={styles.idText}>
                #{node.categoryId}
              </Typography>
            </Box>
          )}

          {/* Отступ для уровня вложенности */}
          <Box sx={styles.indent(level)} />

          {/* Иконка раскрытия/сворачивания - показываем только если есть дочерние */}
          {hasChildren ? (
            <IconButton
              size="small"
              onClick={() => onToggleExpand(node.categoryId)}
              sx={styles.expandButton}
              disabled={isLoadingChildren}
            >
              {isExpanded ? (
                <KeyboardArrowDownIcon fontSize="small" />
              ) : (
                <KeyboardArrowRightIcon fontSize="small" />
              )}
            </IconButton>
          ) : (
            <Box sx={styles.expandPlaceholder} />
          )}

          {/* Изображение категории */}
          {node.imageUrl ? (
            <Avatar
              src={node.imageUrl}
              sx={styles.categoryAvatar}
              variant="rounded"
            >
              <PhotoIcon />
            </Avatar>
          ) : (
            <Box sx={styles.imagePlaceholder}>
              <PhotoIcon sx={styles.imageIcon} />
            </Box>
          )}

          <Box sx={styles.titleBlock}>
            <Typography variant="body2" sx={styles.categoryName}>
              {node.name}
            </Typography>
            {isMobile && (
              <Typography variant="caption" sx={styles.mobileIdText}>
                #{node.categoryId}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Действия */}
        <Box sx={styles.actions}>
          <Tooltip title="Редактировать" arrow>
            <IconButton
              size="small"
              onClick={() => onEdit(node.categoryId)}
              sx={styles.editButton}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {isMobile ? (
            <>
              <Tooltip title="Еще действия" arrow>
                <IconButton size="small" onClick={openMoreMenu}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Menu anchorEl={moreAnchorEl} open={isMoreOpen} onClose={closeMoreMenu}>
                {!hasChildren && onManageFilters && (
                  <MenuItem onClick={() => runActionAndClose(() => onManageFilters(node.categoryId, node.name))}>
                    <ListItemIcon>
                      <FilterListIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Фильтры</ListItemText>
                  </MenuItem>
                )}
                {onMoveUp != null && (
                  <MenuItem disabled={!canMoveUp} onClick={() => runActionAndClose(() => onMoveUp(node.categoryId, parentId))}>
                    <ListItemIcon>
                      <ArrowUpwardIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Выше в списке</ListItemText>
                  </MenuItem>
                )}
                {onMoveDown != null && (
                  <MenuItem disabled={!canMoveDown} onClick={() => runActionAndClose(() => onMoveDown(node.categoryId, parentId))}>
                    <ListItemIcon>
                      <ArrowDownwardIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Ниже в списке</ListItemText>
                  </MenuItem>
                )}
                <MenuItem onClick={() => runActionAndClose(() => onDelete(node.categoryId))}>
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Удалить</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              {!hasChildren && onManageFilters && (
                <Tooltip title="Управление фильтрами" arrow>
                  <IconButton
                    size="small"
                    onClick={() => onManageFilters(node.categoryId, node.name)}
                    sx={styles.filtersButton}
                  >
                    <FilterListIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onMoveUp != null && (
                <Tooltip title="Выше в списке" arrow>
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => onMoveUp(node.categoryId, parentId)}
                      disabled={!canMoveUp}
                      sx={{ minWidth: 32 }}
                    >
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {onMoveDown != null && (
                <Tooltip title="Ниже в списке" arrow>
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => onMoveDown(node.categoryId, parentId)}
                      disabled={!canMoveDown}
                      sx={{ minWidth: 32 }}
                    >
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              <Tooltip title="Удалить" arrow>
                <IconButton
                  size="small"
                  onClick={() => onDelete(node.categoryId)}
                  sx={styles.deleteButton}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>

      {/* Дочерние категории */}
      {hasChildren && isExpanded && (
        <Box sx={styles.childrenContainer}>
          {isLoadingChildren ? (
            <Box sx={styles.loadingChildren}>
              <CircularProgress size={16} />
            </Box>
          ) : sortedChildren.length > 0 ? (
            sortedChildren.map((child, index) => (
              <CategoryTreeNode
                key={child.categoryId}
                node={child}
                level={level + 1}
                parentId={node.categoryId}
                indexInSiblings={index}
                siblingsCount={sortedChildren.length}
                expanded={expanded}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
                onManageFilters={onManageFilters}
                fetchChildren={fetchChildren}
                childrenCache={childrenCache}
                loadingChildren={loadingChildren}
                selectedCategories={selectedCategories}
                onSelect={onSelect}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                isMovingOrder={isMovingOrder}
              />
            ))
          ) : null}
        </Box>
      )}
    </Box>
  );
};

