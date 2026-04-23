import React, { Component } from 'react';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0,
      images: [
        '/admin/images/watch1.jpg',
        '/admin/images/Dong-ho-Tsar-Bomba-TB8208D-13-1485749575.jpg',
        '/admin/images/dong-ho-thuy-sy-3415868203625-1681837772.jpg',
      ],
      imageErrors: {} // Track lỗi từng ảnh
    };
    this.interval = null;
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      this.setState((prevState) => ({
        currentIndex:
          (prevState.currentIndex + 1) % prevState.images.length
      }));
    }, 2500);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  handlePrevClick = () => {
    clearInterval(this.interval);
    this.setState((prevState) => ({
      currentIndex:
        prevState.currentIndex === 0
          ? prevState.images.length - 1
          : prevState.currentIndex - 1
    }), () => this.startSlideshow());
  }

  handleNextClick = () => {
    clearInterval(this.interval);
    this.setState((prevState) => ({
      currentIndex: (prevState.currentIndex + 1) % prevState.images.length
    }), () => this.startSlideshow());
  }

  startSlideshow = () => {
    this.interval = setInterval(() => {
      this.setState((prevState) => ({
        currentIndex:
          (prevState.currentIndex + 1) % prevState.images.length
      }));
    }, 2500);
  }

  handleImageError = (index) => {
    console.error(`Ảnh ${index} không tải được:`, this.state.images[index]);
    this.setState((prevState) => ({
      imageErrors: {
        ...prevState.imageErrors,
        [index]: true
      }
    }));
  }

  render() {
    const { currentIndex, images, imageErrors } = this.state;
    const imagePath = images[currentIndex];
    const hasError = imageErrors[currentIndex];

    return (
      <div className="align-center">
        <h2 className="text-center">ADMIN HOME</h2>
        
        <div style={{ position: "relative", display: "inline-block" }}>
          {hasError ? (
            <div 
              style={{
                width: "800px",
                height: "800px",
                backgroundColor: "#f8f9fa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #ddd",
                fontSize: "16px",
                color: "#6c757d"
              }}
            >
              Ảnh không khả dụng: {images[currentIndex]}
            </div>
          ) : (
            <img
              src={imagePath}
              width="800px"
              height="800px"
              alt="slideshow"
              style={{ display: "block", border: "1px solid #ddd" }}
              onError={() => this.handleImageError(currentIndex)}
            />
          )}

          {/* Nút Previous */}
          <button
            onClick={this.handlePrevClick}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              border: "none",
              padding: "10px 15px",
              cursor: "pointer",
              borderRadius: "4px",
              fontSize: "18px",
              zIndex: 10
            }}
          >
            ❮
          </button>

          {/* Nút Next */}
          <button
            onClick={this.handleNextClick}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              border: "none",
              padding: "10px 15px",
              cursor: "pointer",
              borderRadius: "4px",
              fontSize: "18px",
              zIndex: 10
            }}
          >
            ❯
          </button>

          {/* Dots */}
          <div style={{ textAlign: "center", marginTop: "15px" }}>
            {images.map((_, index) => (
              <span
                key={index}
                onClick={() => {
                  clearInterval(this.interval);
                  this.setState({ currentIndex: index }, () => this.startSlideshow());
                }}
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: index === currentIndex ? "#007bff" : "#ccc",
                  margin: "0 6px",
                  cursor: "pointer",
                  transition: "background-color 0.3s"
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default Home;