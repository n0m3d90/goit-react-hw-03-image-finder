import { Component } from 'react';
import PropTypes from 'prop-types';
import s from './ImageGallery.module.css';
import getImages from '../services/imgApi';
import ImageGalleryItem from '../ImageGalleryItem/ImageGalleryItem';
import Loader from '../Loader/Loader';
import Button from '../Button/Button';

export default class ImageGallery extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    inputValue: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    loadMoreBtn: PropTypes.func.isRequired,
  };

  state = {
    images: [],
    status: 'idle',
  };

  componentDidUpdate(prevProps) {
    if (prevProps.inputValue !== this.props.inputValue) {
      this.setState({ status: 'pending', images: [] }, this.fetchLoad);
    }
    if (prevProps.page !== this.props.page && this.props.page > 1) {
      this.fetchLoadMore();
    }
  }

  fetchLoad = async () => {
    const { inputValue, page } = this.props;
    try {
      const response = await getImages(inputValue, page);
      if (response.hits.length === 0) {
        this.setState({ status: 'idle' });
        return alert('No results found');
      }
      this.setState({
        images: response.hits,
        status: 'resolve',
      });
    } catch (error) {
      this.setState({ status: 'rejected' });
      console.error('Error fetching images:', error);
    }
  };

  fetchLoadMore = async () => {
    const { inputValue, page } = this.props;
    try {
      const response = await getImages(inputValue, page);
      this.setState(prevState => ({
        images: [...prevState.images, ...response.hits],
        status: 'resolve',
      }));
    } catch (error) {
      this.setState({ status: 'rejected' });
      console.error('Error fetching more images:', error);
    }
  };

  render() {
    const { images, status } = this.state;

    if (status === 'pending') {
      return <Loader />;
    }

    if (status === 'resolve') {
      return (
        <>
          <ul className={s.gallery}>
            {images.map(({ id, largeImageURL, tags }) => (
              <ImageGalleryItem
                key={id}
                url={largeImageURL}
                tags={tags}
                onClick={this.props.onClick}
              />
            ))}
          </ul>
          {images.length !== 0 && (
            <Button onClick={this.props.loadMoreBtn} />
          )}
        </>
      );
    }

    return null;
  }
}
